const nodemailer = require("nodemailer");
const {
  getRegistrationConfirmationTemplate,
  getBroadcastTemplate,
  getEventUpdateTemplate,
  getVolunteerConfirmationTemplate,
} = require("../utils/emailTemplates");

// Create Google SMTP transporter
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Fallback to SendGrid if Gmail fails
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Helper function to send email with Gmail primary and SendGrid fallback
async function sendEmailWithFallback(mailOptions) {
  try {
    // Try Gmail first
    const transporter = createGmailTransporter();
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully via Gmail to ${mailOptions.to}`);
    return true;
  } catch (gmailError) {
    console.warn(`Gmail failed: ${gmailError.message}. Trying SendGrid fallback...`);
    
    try {
      // Fallback to SendGrid
      const sgMailOptions = {
        to: mailOptions.to,
        from: process.env.SENDGRID_FROM_EMAIL || process.env.SENDER_EMAIL,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
      };
      
      await sgMail.send(sgMailOptions);
      console.log(`Email sent successfully via SendGrid fallback to ${mailOptions.to}`);
      return true;
    } catch (sendGridError) {
      console.error(`Both Gmail and SendGrid failed:`, {
        gmail: gmailError.message,
        sendgrid: sendGridError.response?.body || sendGridError.message
      });
      return false;
    }
  }
}

async function sendResetCodeEmail(email, resetCode) {
  const mailOptions = {
    to: email,
    from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
    subject: "Reset Password OTP Code - Sheltax",
    text: `Your reset password OTP code is: ${resetCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested to reset your password. Use the OTP code below:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${resetCode}</h1>
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Best regards,<br>Sheltax Team</p>
      </div>
    `,
  };

  return await sendEmailWithFallback(mailOptions);
}

async function sendVerificationCodeEmail(email, verificationCode) {
  const mailOptions = {
    to: email,
    from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
    subject: "Email Verification Code - Sheltax",
    text: `Your email verification code is: ${verificationCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Sheltax!</h2>
        <p>Thank you for signing up. Please verify your email address using the code below:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #28a745; font-size: 32px; margin: 0;">${verificationCode}</h1>
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Best regards,<br>Sheltax Team</p>
      </div>
    `,
  };

  return await sendEmailWithFallback(mailOptions);
}

async function sendRegistrationConfirmation(email, eventDetails, bookingDetails) {
  const template = getRegistrationConfirmationTemplate(eventDetails, bookingDetails);
  
  const mailOptions = {
    to: email,
    from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
    subject: template.subject,
    text: template.text,
    html: template.html,
  };

  return await sendEmailWithFallback(mailOptions);
}

async function sendVolunteerConfirmation(email, eventDetails, bookingDetails) {
  const template = getVolunteerConfirmationTemplate(eventDetails, bookingDetails);
  
  const mailOptions = {
    to: email,
    from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
    subject: template.subject,
    text: template.text,
    html: template.html,
  };

  return await sendEmailWithFallback(mailOptions);
}

async function sendBroadcastToAttendees(emails, eventTitle, subject, message, organizer) {
  const template = getBroadcastTemplate(eventTitle, subject, message, organizer);
  
  // Send emails in batches to avoid rate limiting
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchPromises = batch.map(email => {
      const mailOptions = {
        to: email,
        from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
        subject: template.subject,
        text: template.text,
        html: template.html,
      };
      return sendEmailWithFallback(mailOptions);
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`Broadcast sent to ${successCount}/${emails.length} attendees`);
  
  return successCount > 0;
}

async function sendEventUpdate(emails, eventTitle, updateMessage, organizer) {
  const template = getEventUpdateTemplate(eventTitle, updateMessage, organizer);
  
  const messages = emails.map((email) => ({
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: template.subject,
    text: template.text,
    html: template.html,
  }));

  try {
    await sgMail.send(messages);
    console.log(`Event update sent to ${emails.length} attendees`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send event update:",
      error.response?.body || error.message
    );
    return false;
  }
}

async function sendTourConfirmation(email, tourDetails, bookingDetails) {
  const { getTourConfirmationTemplate } = require("../utils/emailTemplates");
  const template = getTourConfirmationTemplate(tourDetails, bookingDetails);
  
  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: template.subject,
    text: template.text,
    html: template.html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Tour confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send tour confirmation:",
      error.response?.body || error.message
    );
    return false;
  }
}

async function sendTripConfirmation(email, tripDetails, bookingDetails) {
  const { getTripConfirmationTemplate } = require("../utils/emailTemplates");
  const template = getTripConfirmationTemplate(tripDetails, bookingDetails);
  
  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: template.subject,
    text: template.text,
    html: template.html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Trip confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send trip confirmation:",
      error.response?.body || error.message
    );
    return false;
  }
}

async function sendReadingVisitConfirmation(email, visitDetails) {
  const { fullName, bookTitle, preferredDate } = visitDetails;

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: "Reading Visit Confirmed - CBAAC Library",
    text: `
Hello ${fullName},

Your reading visit to CBAAC Library has been confirmed!

Details:
- Book: ${bookTitle}
- Preferred Date: ${preferredDate}

We look forward to seeing you at the library.

Best regards,
CBAAC Library Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #8B4513; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reading Visit Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>Your reading visit to CBAAC Library has been confirmed!</p>
      
      <div class="details">
        <h3>Visit Details:</h3>
        <p><strong>Book:</strong> ${bookTitle}</p>
        <p><strong>Preferred Date:</strong> ${preferredDate}</p>
      </div>
      
      <p>We look forward to seeing you at the library.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>CBAAC Library Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`Reading visit confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send reading visit confirmation:",
      error.response?.body || error.message
    );
    return false;
  }
}

async function sendLibrarianContactNotification(contactDetails) {
  const { name, email, subject, message } = contactDetails;
  const librarianEmail = process.env.LIBRARIAN_EMAIL || process.env.SENDER_EMAIL;

  const msg = {
    to: librarianEmail,
    from: process.env.SENDER_EMAIL,
    subject: `Library Contact: ${subject || "New Message"}`,
    text: `
New contact message from library visitor:

Name: ${name}
Email: ${email}
Subject: ${subject || "N/A"}

Message:
${message}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; }
    .message { background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #8B4513; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Library Contact</h1>
    </div>
    <div class="content">
      <div class="details">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
      </div>
      
      <div class="message">
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`Librarian contact notification sent`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send librarian contact notification:",
      error.response?.body || error.message
    );
    return false;
  }
}

async function sendRentalRequestConfirmation(email, requestDetails) {
  const { fullName, artifactTitle, identificationNumber, startDate, endDate } = requestDetails;

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: "Artifact Rental Request Received - CBAAC Museum",
    text: `
Hello ${fullName},

Thank you for your interest in renting an artifact from CBAAC Museum.

Your rental request has been received and is being reviewed by our team.

Request Details:
- Artifact: ${artifactTitle}
- ID: ${identificationNumber}
- Requested Period: ${startDate} to ${endDate}

We will contact you shortly regarding your request.

Best regards,
CBAAC Museum Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #8B4513; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Rental Request Received</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>Thank you for your interest in renting an artifact from CBAAC Museum.</p>
      <p>Your rental request has been received and is being reviewed by our team.</p>
      
      <div class="details">
        <h3>Request Details:</h3>
        <p><strong>Artifact:</strong> ${artifactTitle}</p>
        <p><strong>ID:</strong> ${identificationNumber}</p>
        <p><strong>Requested Period:</strong> ${startDate} to ${endDate}</p>
      </div>
      
      <p>We will contact you shortly regarding your request.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>CBAAC Museum Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`Rental request confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send rental request confirmation:",
      error.response?.body || error.message
    );
    return false;
  }
}

async function sendRentalRequestNotification(requestDetails) {
  const adminEmail = process.env.MUSEUM_ADMIN_EMAIL || process.env.SENDER_EMAIL;
  const {
    fullName,
    organization,
    email,
    phoneNumber,
    artifactTitle,
    identificationNumber,
    purposeOfRental,
    startDate,
    endDate,
    message,
  } = requestDetails;

  const msg = {
    to: adminEmail,
    from: process.env.SENDER_EMAIL,
    subject: `New Artifact Rental Request: ${identificationNumber}`,
    text: `
New artifact rental request received:

Requester Information:
- Name: ${fullName}
- Organization: ${organization || "N/A"}
- Email: ${email}
- Phone: ${phoneNumber}

Artifact Details:
- Title: ${artifactTitle}
- ID: ${identificationNumber}

Rental Details:
- Purpose: ${purposeOfRental}
- Period: ${startDate} to ${endDate}

Message:
${message || "N/A"}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .section { background-color: white; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Rental Request</h1>
    </div>
    <div class="content">
      <div class="section">
        <h3>Requester Information:</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Organization:</strong> ${organization || "N/A"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>
      </div>
      
      <div class="section">
        <h3>Artifact Details:</h3>
        <p><strong>Title:</strong> ${artifactTitle}</p>
        <p><strong>ID:</strong> ${identificationNumber}</p>
      </div>
      
      <div class="section">
        <h3>Rental Details:</h3>
        <p><strong>Purpose:</strong> ${purposeOfRental}</p>
        <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
        <p><strong>Message:</strong> ${message || "N/A"}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`Rental request notification sent to admin`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send rental request notification:",
      error.response?.body || error.message
    );
    return false;
  }
}

async function sendCollaborationRequestNotification(requestDetails) {
  const adminEmail = process.env.MUSEUM_ADMIN_EMAIL || process.env.SENDER_EMAIL;
  const { name, organization, email, message } = requestDetails;

  const msg = {
    to: adminEmail,
    from: process.env.SENDER_EMAIL,
    subject: "New Museum Collaboration Request",
    text: `
New collaboration request received:

Name: ${name}
Organization: ${organization || "N/A"}
Email: ${email}

Message:
${message}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; }
    .message { background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #8B4513; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Collaboration Request</h1>
    </div>
    <div class="content">
      <div class="details">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Organization:</strong> ${organization || "N/A"}</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
      
      <div class="message">
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`Collaboration request notification sent to admin`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send collaboration request notification:",
      error.response?.body || error.message
    );
    return false;
  }
}

async function sendFilmBookingConfirmation(email, bookingDetails) {
  const { fullName, filmTitle, screeningDate, startTime, numberOfSeats, ticketId, qrCode } = bookingDetails;

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: `Film Screening Confirmed: ${filmTitle}`,
    text: `
Hello ${fullName},

Your film screening booking has been confirmed!

Screening Details:
- Film: ${filmTitle}
- Date: ${screeningDate}
- Time: ${startTime}
- Number of Seats: ${numberOfSeats}
- Ticket ID: ${ticketId}

Please present your ticket ID or QR code at the entrance.

Location: CBAAC Film Hall

See you at the screening!

Best regards,
CBAAC Films Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #DC143C; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #DC143C; }
    .qr-code { text-align: center; margin: 20px 0; }
    .qr-code img { max-width: 200px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎬 Screening Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>Your film screening booking has been confirmed!</p>
      
      <div class="details">
        <h3>Screening Details:</h3>
        <p><strong>Film:</strong> ${filmTitle}</p>
        <p><strong>Date:</strong> ${screeningDate}</p>
        <p><strong>Time:</strong> ${startTime}</p>
        <p><strong>Number of Seats:</strong> ${numberOfSeats}</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Location:</strong> CBAAC Film Hall</p>
      </div>
      
      ${qrCode ? `
      <div class="qr-code">
        <h3>Your Ticket QR Code:</h3>
        <img src="${qrCode}" alt="QR Code" />
        <p>Please present this QR code at the entrance</p>
      </div>
      ` : ""}
      
      <p>See you at the screening!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>CBAAC Films Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`Film booking confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send film booking confirmation:",
      error.response?.body || error.message
    );
    return false;
  }
}

async function sendFilmScreeningReminder(email, reminderDetails) {
  const { fullName, filmTitle, screeningDate, startTime, ticketId } = reminderDetails;

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: `Reminder: Film Screening Tomorrow - ${filmTitle}`,
    text: `
Hello ${fullName},

This is a reminder that your film screening is tomorrow!

Screening Details:
- Film: ${filmTitle}
- Date: ${screeningDate}
- Time: ${startTime}
- Ticket ID: ${ticketId}

Location: CBAAC Film Hall

Please arrive 15 minutes early.

See you tomorrow!

Best regards,
CBAAC Films Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #DC143C; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .reminder { background-color: #FFF3CD; padding: 15px; margin: 15px 0; border-left: 4px solid #FFC107; }
    .details { background-color: white; padding: 15px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Screening Tomorrow!</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${fullName}</strong>,</p>
      
      <div class="reminder">
        <h3>Your film screening is tomorrow!</h3>
      </div>
      
      <div class="details">
        <h3>Screening Details:</h3>
        <p><strong>Film:</strong> ${filmTitle}</p>
        <p><strong>Date:</strong> ${screeningDate}</p>
        <p><strong>Time:</strong> ${startTime}</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Location:</strong> CBAAC Film Hall</p>
      </div>
      
      <p><strong>Please arrive 15 minutes early.</strong></p>
      <p>See you tomorrow!</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>CBAAC Films Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`Film screening reminder sent to ${email}`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send film screening reminder:",
      error.response?.body || error.message
    );
    return false;
  }
}

async function sendFilmInquiryNotification(inquiryDetails) {
  const adminEmail = process.env.FILMS_ADMIN_EMAIL || process.env.SENDER_EMAIL;
  const { fullName, email, phoneNumber, filmTitle, message } = inquiryDetails;

  const msg = {
    to: adminEmail,
    from: process.env.SENDER_EMAIL,
    subject: `New Film Inquiry: ${filmTitle}`,
    text: `
New film inquiry received:

Name: ${fullName}
Email: ${email}
Phone: ${phoneNumber}
Film: ${filmTitle}

Message:
${message}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #DC143C; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .details { background-color: white; padding: 15px; margin: 15px 0; }
    .message { background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #DC143C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Film Inquiry</h1>
    </div>
    <div class="content">
      <div class="details">
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>
        <p><strong>Film:</strong> ${filmTitle}</p>
      </div>
      
      <div class="message">
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };

  try {
    await sgMail.send(msg);
    console.log(`Film inquiry notification sent to admin`);
    return true;
  } catch (error) {
    console.error(
      "Failed to send film inquiry notification:",
      error.response?.body || error.message
    );
    return false;
  }
}

module.exports = {
  sendVerificationCodeEmail,
  sendResetCodeEmail,
  sendRegistrationConfirmation,
  sendVolunteerConfirmation,
  sendBroadcastToAttendees,
  sendEventUpdate,
  sendTourConfirmation,
  sendTripConfirmation,
  sendReadingVisitConfirmation,
  sendLibrarianContactNotification,
  sendRentalRequestConfirmation,
  sendRentalRequestNotification,
  sendCollaborationRequestNotification,
  sendFilmBookingConfirmation,
  sendFilmScreeningReminder,
  sendFilmInquiryNotification,
};

// Test function to verify email configuration
async function testEmailConfiguration() {
  console.log('Testing email configuration...');
  console.log('Gmail User:', process.env.GMAIL_USER ? '✓ Configured' : '✗ Missing');
  console.log('Gmail App Password:', process.env.GMAIL_APP_PASSWORD ? '✓ Configured' : '✗ Missing');
  console.log('Sender Email:', process.env.SENDER_EMAIL ? '✓ Configured' : '✗ Missing');
  console.log('SendGrid API Key (Backup):', process.env.SENDGRID_API_KEY ? '✓ Configured' : '✗ Missing');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('⚠️  Gmail SMTP not fully configured. Please check GOOGLE_SMTP_SETUP.md');
  } else {
    console.log('✅ Gmail SMTP configuration looks good!');
  }
}

// Call test function on module load
testEmailConfiguration();
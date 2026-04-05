const { Resend } = require("resend");
const {
  getRegistrationConfirmationTemplate,
  getBroadcastTemplate,
  getEventUpdateTemplate,
  getVolunteerConfirmationTemplate,
} = require("../utils/emailTemplates");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.SENDER_EMAIL || "onboarding@resend.dev";
const FROM_NAME = process.env.SENDER_NAME || "Sheltax";

async function sendEmail({ to, subject, html, text }) {
  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM}>`,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error(`Resend error sending to ${to}:`, error);
      return false;
    }
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err.message);
    return false;
  }
}

async function sendResetCodeEmail(email, resetCode) {
  return sendEmail({
    to: email,
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
  });
}

async function sendVerificationCodeEmail(email, verificationCode) {
  return sendEmail({
    to: email,
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
  });
}

async function sendRegistrationConfirmation(email, eventDetails, bookingDetails) {
  const template = getRegistrationConfirmationTemplate(eventDetails, bookingDetails);
  return sendEmail({ to: email, ...template });
}

async function sendVolunteerConfirmation(email, eventDetails, bookingDetails) {
  const template = getVolunteerConfirmationTemplate(eventDetails, bookingDetails);
  return sendEmail({ to: email, ...template });
}

async function sendBroadcastToAttendees(emails, eventTitle, subject, message, organizer) {
  const template = getBroadcastTemplate(eventTitle, subject, message, organizer);
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(email => sendEmail({ to: email, ...template }))
    );
    results.push(...batchResults);
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const successCount = results.filter(r => r.status === "fulfilled" && r.value).length;
  console.log(`Broadcast sent to ${successCount}/${emails.length} attendees`);
  return successCount > 0;
}

async function sendEventUpdate(emails, eventTitle, updateMessage, organizer) {
  const template = getEventUpdateTemplate(eventTitle, updateMessage, organizer);
  const results = await Promise.allSettled(
    emails.map(email => sendEmail({ to: email, ...template }))
  );
  const successCount = results.filter(r => r.status === "fulfilled" && r.value).length;
  console.log(`Event update sent to ${successCount}/${emails.length} attendees`);
  return successCount > 0;
}

async function sendTourConfirmation(email, tourDetails, bookingDetails) {
  const { getTourConfirmationTemplate } = require("../utils/emailTemplates");
  const template = getTourConfirmationTemplate(tourDetails, bookingDetails);
  return sendEmail({ to: email, ...template });
}

async function sendTripConfirmation(email, tripDetails, bookingDetails) {
  const { getTripConfirmationTemplate } = require("../utils/emailTemplates");
  const template = getTripConfirmationTemplate(tripDetails, bookingDetails);
  return sendEmail({ to: email, ...template });
}

async function sendReadingVisitConfirmation(email, visitDetails) {
  const { fullName, bookTitle, preferredDate } = visitDetails;
  return sendEmail({
    to: email,
    subject: "Reading Visit Confirmed - CBAAC Library",
    text: `Hello ${fullName}, your reading visit for "${bookTitle}" on ${preferredDate} is confirmed.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reading Visit Confirmed!</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Your reading visit to CBAAC Library has been confirmed!</p>
        <p><strong>Book:</strong> ${bookTitle}</p>
        <p><strong>Preferred Date:</strong> ${preferredDate}</p>
        <p>Best regards,<br>CBAAC Library Team</p>
      </div>
    `,
  });
}

async function sendLibrarianContactNotification(contactDetails) {
  const { name, email, subject, message } = contactDetails;
  const to = process.env.LIBRARIAN_EMAIL || FROM;
  return sendEmail({
    to,
    subject: `Library Contact: ${subject || "New Message"}`,
    text: `From: ${name} (${email})\n\n${message}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject || "N/A"}</p><p>${message.replace(/\n/g, "<br>")}</p>`,
  });
}

async function sendRentalRequestConfirmation(email, requestDetails) {
  const { fullName, artifactTitle, identificationNumber, startDate, endDate } = requestDetails;
  return sendEmail({
    to: email,
    subject: "Artifact Rental Request Received - CBAAC Museum",
    text: `Hello ${fullName}, your rental request for "${artifactTitle}" (${identificationNumber}) from ${startDate} to ${endDate} has been received.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Rental Request Received</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p><strong>Artifact:</strong> ${artifactTitle}</p>
        <p><strong>ID:</strong> ${identificationNumber}</p>
        <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
        <p>We will contact you shortly.</p>
        <p>Best regards,<br>CBAAC Museum Team</p>
      </div>
    `,
  });
}

async function sendRentalRequestNotification(requestDetails) {
  const { fullName, organization, email, phoneNumber, artifactTitle, identificationNumber, purposeOfRental, startDate, endDate, message } = requestDetails;
  const to = process.env.MUSEUM_ADMIN_EMAIL || FROM;
  return sendEmail({
    to,
    subject: `New Artifact Rental Request: ${identificationNumber}`,
    text: `Name: ${fullName}\nOrg: ${organization}\nEmail: ${email}\nPhone: ${phoneNumber}\nArtifact: ${artifactTitle} (${identificationNumber})\nPurpose: ${purposeOfRental}\nPeriod: ${startDate} to ${endDate}\n${message || ""}`,
    html: `<p><strong>Name:</strong> ${fullName}</p><p><strong>Org:</strong> ${organization || "N/A"}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phoneNumber}</p><p><strong>Artifact:</strong> ${artifactTitle} (${identificationNumber})</p><p><strong>Purpose:</strong> ${purposeOfRental}</p><p><strong>Period:</strong> ${startDate} to ${endDate}</p><p>${message || ""}</p>`,
  });
}

async function sendCollaborationRequestNotification(requestDetails) {
  const { name, organization, email, message } = requestDetails;
  const to = process.env.MUSEUM_ADMIN_EMAIL || FROM;
  return sendEmail({
    to,
    subject: "New Museum Collaboration Request",
    text: `Name: ${name}\nOrg: ${organization || "N/A"}\nEmail: ${email}\n\n${message}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Org:</strong> ${organization || "N/A"}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, "<br>")}</p>`,
  });
}

async function sendFilmBookingConfirmation(email, bookingDetails) {
  const { fullName, filmTitle, screeningDate, startTime, numberOfSeats, ticketId, qrCode } = bookingDetails;
  return sendEmail({
    to: email,
    subject: `Film Screening Confirmed: ${filmTitle}`,
    text: `Hello ${fullName}, your booking for "${filmTitle}" on ${screeningDate} at ${startTime} is confirmed. Ticket ID: ${ticketId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Screening Confirmed!</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p><strong>Film:</strong> ${filmTitle}</p>
        <p><strong>Date:</strong> ${screeningDate}</p>
        <p><strong>Time:</strong> ${startTime}</p>
        <p><strong>Seats:</strong> ${numberOfSeats}</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        ${qrCode ? `<img src="${qrCode}" alt="QR Code" style="max-width:200px;" />` : ""}
        <p>Best regards,<br>CBAAC Films Team</p>
      </div>
    `,
  });
}

async function sendFilmScreeningReminder(email, reminderDetails) {
  const { fullName, filmTitle, screeningDate, startTime, ticketId } = reminderDetails;
  return sendEmail({
    to: email,
    subject: `Reminder: Film Screening Tomorrow - ${filmTitle}`,
    text: `Hello ${fullName}, reminder that your screening of "${filmTitle}" is tomorrow (${screeningDate}) at ${startTime}. Ticket ID: ${ticketId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Screening Tomorrow!</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p><strong>Film:</strong> ${filmTitle}</p>
        <p><strong>Date:</strong> ${screeningDate}</p>
        <p><strong>Time:</strong> ${startTime}</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p>Please arrive 15 minutes early.</p>
        <p>Best regards,<br>CBAAC Films Team</p>
      </div>
    `,
  });
}

async function sendFilmInquiryNotification(inquiryDetails) {
  const { fullName, email, phoneNumber, filmTitle, message } = inquiryDetails;
  const to = process.env.FILMS_ADMIN_EMAIL || FROM;
  return sendEmail({
    to,
    subject: `New Film Inquiry: ${filmTitle}`,
    text: `Name: ${fullName}\nEmail: ${email}\nPhone: ${phoneNumber}\nFilm: ${filmTitle}\n\n${message}`,
    html: `<p><strong>Name:</strong> ${fullName}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phoneNumber}</p><p><strong>Film:</strong> ${filmTitle}</p><p>${message.replace(/\n/g, "<br>")}</p>`,
  });
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

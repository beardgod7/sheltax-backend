import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || '"SheltaX" <noreply@sheltax.com>';

let transporter: nodemailer.Transporter | null = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export const sendOtpEmail = async (toEmail: string, otpCode: string, firstName: string): Promise<void> => {
  const subject = `Your Shelta-X Verification Code: ${otpCode}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
      <h2 style="color: #0F172A; text-align: center;">Welcome to Shelta-X</h2>
      <p>Hello ${firstName},</p>
      <p>Thank you for starting your registration with Shelta-X. Your 6-digit OTP verification code is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563EB; background: #F1F5F9; padding: 12px 24px; border-radius: 8px; border: 1px dashed #CBD5E1;">
          ${otpCode}
        </span>
      </div>
      <p>This code is valid for <strong>10 minutes</strong>. Please enter it on the verification screen to complete your email verification.</p>
      <p style="color: #64748B; font-size: 13px; margin-top: 30px;">If you did not request this code, please ignore this email.</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: emailFrom,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`✉️ OTP email sent to ${toEmail} via SMTP.`);
    } catch (error) {
      console.error(`❌ Failed to send SMTP email to ${toEmail}:`, error);
      console.log(`[DEV OTP FALLBACK] OTP for ${toEmail}: ${otpCode}`);
    }
  } else {
    console.log(`\n==================================================`);
    console.log(`✉️ [DEV MODE OTP EMAIL]`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`==================================================\n`);
  }
};

export const sendWelcomeEmail = async (user: { email: string; firstName: string; role: string }): Promise<void> => {
  const subject = `Welcome to Shelta-X, ${user.firstName}!`;
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
        <h1 style="color: #f2c502; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Shelta-X</h1>
        <p style="color: #94a3b8; margin-top: 6px; font-size: 14px;">The Smart Property & Real Estate Platform</p>
      </div>

      <div style="padding: 32px 28px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">Welcome aboard, ${user.firstName}! 🎉</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your email has been verified and your <strong>${user.role.toUpperCase()}</strong> account is now fully active.</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">You can now browse properties, manage listings, save favorites, and connect directly with verified owners and seekers across Nigeria.</p>

        <div style="margin: 32px 0; text-align: center;">
          <a href="http://localhost:3000" style="background-color: #f2c502; color: #0f172a; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            Explore Shelta-X Now →
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Need support? Contact our 24/7 team at support@sheltax.com</p>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({ from: emailFrom, to: user.email, subject, html: htmlContent });
      console.log(`✉️ Welcome email sent to ${user.email}`);
    } catch (err) {
      console.error(`❌ Welcome email error for ${user.email}:`, err);
    }
  } else {
    console.log(`✉️ [DEV WELCOME EMAIL] To: ${user.email} (Role: ${user.role})`);
  }
};

export const sendNewListingAdminNotificationEmail = async (
  adminEmail: string,
  property: { id: string; title: string; intent: string; price: number; currency?: string; location: string; state: string },
  owner: { firstName: string; surname: string; email: string }
): Promise<void> => {
  const subject = `[Action Required] New Property Listing Pending Approval: ${property.title}`;
  const formattedPrice = `${property.currency || 'NGN'} ${Number(property.price).toLocaleString()}`;

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background-color: #0f172a; padding: 28px 24px; text-align: center;">
        <span style="background-color: #f2c502; color: #0f172a; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; tracking: 1px;">Admin Alert</span>
        <h2 style="color: #ffffff; margin: 12px 0 0 0; font-size: 22px; font-weight: 700;">New Property Submitted</h2>
      </div>

      <div style="padding: 28px; background-color: #ffffff;">
        <p style="color: #475569; font-size: 15px; margin-top: 0;">A new property listing has been posted and requires admin review before appearing on the marketplace.</p>

        <div style="background-color: #f1f5f9; border-left: 4px solid #f2c502; padding: 18px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 17px;">${property.title}</h3>
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Intent:</strong> ${property.intent}</p>
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Price:</strong> ${formattedPrice}</p>
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Location:</strong> ${property.location}, ${property.state}</p>
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Posted By:</strong> ${owner.firstName} ${owner.surname} (${owner.email})</p>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="http://localhost:3001/properties" style="background-color: #0f172a; color: #f2c502; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">
            Review & Approve in Admin Panel →
          </a>
        </div>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({ from: emailFrom, to: adminEmail, subject, html: htmlContent });
      console.log(`✉️ Admin notification sent to ${adminEmail}`);
    } catch (err) {
      console.error(`❌ Admin email error:`, err);
    }
  } else {
    console.log(`✉️ [DEV ADMIN EMAIL] To: ${adminEmail} (Listing: ${property.title})`);
  }
};

export const sendListingStatusEmail = async (
  ownerEmail: string,
  ownerName: string,
  propertyTitle: string,
  status: 'APPROVED' | 'REJECTED',
  rejectionReason?: string
): Promise<void> => {
  const isApproved = status === 'APPROVED';
  const subject = isApproved
    ? `Great News! Your Listing "${propertyTitle}" has been Approved!`
    : `Update regarding your listing "${propertyTitle}"`;

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background-color: ${isApproved ? '#059669' : '#dc2626'}; padding: 28px 24px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">
          ${isApproved ? 'Listing Approved & Live!' : 'Listing Review Update'}
        </h2>
      </div>

      <div style="padding: 28px; background-color: #ffffff;">
        <p style="color: #475569; font-size: 15px; margin-top: 0;">Hello ${ownerName},</p>
        ${
          isApproved
            ? `<p style="color: #475569; font-size: 15px; line-height: 1.6;">Your property listing <strong>"${propertyTitle}"</strong> has been reviewed and approved by Shelta-X administrators. It is now live and visible to buyers and renters!</p>`
            : `<p style="color: #475569; font-size: 15px; line-height: 1.6;">Your property listing <strong>"${propertyTitle}"</strong> requires adjustments before it can be published.</p>
               <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; border-radius: 8px; margin: 16px 0; color: #991b1b; font-size: 14px;">
                 <strong>Reason for rejection:</strong> ${rejectionReason || 'Please review your listing details and image quality.'}
               </div>`
        }

        <div style="margin: 28px 0; text-align: center;">
          <a href="http://localhost:3000/owner/listings" style="background-color: #f2c502; color: #0f172a; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
            View My Listings →
          </a>
        </div>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({ from: emailFrom, to: ownerEmail, subject, html: htmlContent });
      console.log(`✉️ Listing status email sent to ${ownerEmail} (${status})`);
    } catch (err) {
      console.error(`❌ Listing status email error:`, err);
    }
  } else {
    console.log(`✉️ [DEV LISTING STATUS EMAIL] To: ${ownerEmail} (Status: ${status})`);
  }
};

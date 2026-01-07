# Google SMTP Setup Guide

This guide explains how to set up Google SMTP for sending emails in the Sheltax backend application.

## Prerequisites

1. A Gmail account
2. Two-factor authentication enabled on your Gmail account

## Step 1: Enable 2-Factor Authentication

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security**
3. Enable **2-Step Verification** if not already enabled

## Step 2: Generate App Password

1. In your Google Account settings, go to **Security**
2. Under "Signing in to Google", click **App passwords**
3. Select **Mail** as the app
4. Select **Other (Custom name)** as the device
5. Enter "Sheltax Backend" as the custom name
6. Click **Generate**
7. Copy the 16-character app password (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# Email Service (Google SMTP)
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
SENDER_EMAIL=your-gmail-address@gmail.com
SENDER_NAME=Sheltax Platform
```

**Example:**
```env
GMAIL_USER=support@yourcompany.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
SENDER_EMAIL=support@yourcompany.com
SENDER_NAME=Sheltax Platform
```

## Step 4: Test Email Functionality

The system will automatically:
1. **Try Gmail first** - Uses your Gmail SMTP for sending emails
2. **Fallback to SendGrid** - If Gmail fails, it will try SendGrid as backup
3. **Log results** - Check console logs for email sending status

## Email Features

### Primary Service: Gmail SMTP
- ✅ Free for reasonable volumes
- ✅ Reliable delivery
- ✅ Professional appearance
- ✅ Easy setup with app passwords

### Backup Service: SendGrid
- ✅ Automatic fallback if Gmail fails
- ✅ Higher volume capacity
- ✅ Advanced analytics

## Supported Email Types

- 📧 **Email Verification** - Account verification codes
- 🔐 **Password Reset** - Password reset OTP codes
- 👤 **Profile Updates** - Profile-related notifications
- 🏠 **Property Alerts** - Property matching notifications

## Gmail Limits

- **Daily limit**: 500 emails per day for Gmail accounts
- **Rate limit**: 100 emails per hour
- **Attachment size**: 25MB maximum

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**
   - Make sure 2FA is enabled
   - Use app password, not regular password
   - Check email address is correct

2. **"Less secure app access" error**
   - This shouldn't happen with app passwords
   - Make sure you're using app password, not regular password

3. **Rate limiting**
   - Gmail has daily/hourly limits
   - System will automatically fallback to SendGrid

### Testing Email Sending

You can test email functionality using the API endpoints:
- `POST /v1/api/auth/signup` - Sends verification email
- `POST /v1/api/auth/forgot-password` - Sends reset code email

## Security Best Practices

1. **Never commit app passwords** to version control
2. **Use environment variables** for all credentials
3. **Rotate app passwords** periodically
4. **Monitor email logs** for suspicious activity
5. **Use different Gmail accounts** for different environments (dev/staging/prod)

## Production Recommendations

For production environments:
1. Use a dedicated Gmail account (e.g., `noreply@yourcompany.com`)
2. Consider upgrading to Google Workspace for higher limits
3. Keep SendGrid as backup for high-volume scenarios
4. Monitor email delivery rates and logs

Your email service is now configured with Gmail as primary and SendGrid as backup! 🎉
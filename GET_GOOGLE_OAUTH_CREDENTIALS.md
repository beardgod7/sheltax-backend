# How to Get Google OAuth Client ID and Client Secret

Follow these detailed steps to get your Google OAuth credentials for the Sheltax backend.

## 🚀 Quick Steps Overview

1. **Create Google Cloud Project**
2. **Enable APIs**
3. **Configure OAuth Consent Screen**
4. **Create OAuth 2.0 Credentials**
5. **Copy Client ID & Secret**

---

## 📋 Detailed Step-by-Step Guide

### Step 1: Go to Google Cloud Console

1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account: `nwaokefrancis@gmail.com`

### Step 2: Create a New Project

1. Click on the **project dropdown** at the top of the page
2. Click **"New Project"**
3. Enter these details:
   - **Project name**: `Sheltax Backend`
   - **Organization**: Leave as default
4. Click **"Create"**
5. Wait for the project to be created (takes a few seconds)

### Step 3: Enable Required APIs

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** and click on it
3. Click **"Enable"**
4. Also search for **"People API"** and enable it (recommended)

### Step 4: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type (unless you have Google Workspace)
3. Click **"Create"**

#### Fill in OAuth Consent Screen Details:
- **App name**: `Sheltax`
- **User support email**: `nwaokefrancis@gmail.com`
- **App logo**: (optional - you can skip this)
- **App domain**: Leave blank for now
- **Authorized domains**: Leave blank for development
- **Developer contact information**: `nwaokefrancis@gmail.com`

4. Click **"Save and Continue"**
5. On **"Scopes"** page, click **"Save and Continue"** (skip for now)
6. On **"Test users"** page, you can add `nwaokefrancis@gmail.com` as a test user
7. Click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

### Step 5: Create OAuth 2.0 Client ID

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**

#### Configure OAuth Client:
1. **Application type**: Select **"Web application"**
2. **Name**: `Sheltax Backend OAuth Client`

3. **Authorized JavaScript origins**: Add these URLs:
   ```
   http://localhost:3000
   http://localhost:7000
   https://yourdomain.com (for production later)
   ```

4. **Authorized redirect URIs**: Add these URLs:
   ```
   http://localhost:3000/auth/google/callback
   http://localhost:7000/auth/google/callback
   https://yourdomain.com/auth/google/callback (for production later)
   ```

5. Click **"Create"**

### Step 6: Copy Your Credentials

After creating the OAuth client, you'll see a popup with your credentials:

```
Client ID: 123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
Client secret: GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

**⚠️ Important: Copy these values immediately!**

### Step 7: Update Your .env File

Open your `.env` file and update these lines:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

Replace the example values with your actual credentials.

---

## 🧪 Testing Your Setup

### 1. Restart Your Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Test the OAuth Endpoint

You can test using Swagger UI:
1. Go to: **http://localhost:7000/api-docs**
2. Find the **"Authentication"** section
3. Look for **"POST /auth/google-oauth"**
4. Click **"Try it out"**

### 3. Get a Test ID Token

For testing, you can use Google's OAuth 2.0 Playground:
1. Go to: **https://developers.google.com/oauthplayground/**
2. Select **"Google+ API v1"** → **"https://www.googleapis.com/auth/plus.me"**
3. Click **"Authorize APIs"**
4. Sign in with your Google account
5. Click **"Exchange authorization code for tokens"**
6. Copy the **"id_token"** value

### 4. Test with Swagger

In Swagger UI:
1. Paste the ID token in the request body:
   ```json
   {
     "idToken": "your-copied-id-token-here"
   }
   ```
2. Click **"Execute"**
3. Check the response - you should see a successful login!

---

## 🔒 Security Notes

1. **Never commit credentials** to version control
2. **Keep Client Secret private** - never expose in frontend code
3. **Use HTTPS in production**
4. **Regularly rotate credentials** for security

---

## 🚨 Troubleshooting

### Common Issues:

**"Invalid client" error:**
- Double-check your Client ID and Client Secret
- Make sure they're correctly copied to .env file

**"Redirect URI mismatch" error:**
- Verify your redirect URIs in Google Console match exactly
- Include http:// or https:// protocol

**"Access denied" error:**
- Check if your app is in "Testing" mode
- Add your email as a test user in OAuth consent screen

---

## ✅ What's Next?

Once you have your credentials:
1. ✅ Update your `.env` file with real credentials
2. ✅ Restart your server
3. ✅ Test the Google OAuth login
4. ✅ Integrate with your frontend application

Your Google OAuth integration will be fully functional! 🎉
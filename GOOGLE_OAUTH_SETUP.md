# Google OAuth Setup Guide

## Overview
This guide explains how to set up and use Google OAuth authentication in the Sheltax backend.

## Prerequisites
1. Google Cloud Console project
2. OAuth 2.0 credentials configured

## Setup Steps

### 1. Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API or Google Identity API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure authorized origins and redirect URIs
6. Copy the Client ID and Client Secret

### 2. Environment Variables
Add the following to your `.env` file:
```env
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

### 3. Database Migration
The User model has been updated to support Google OAuth. Make sure to run database migrations to add the new fields:
- `googleId` (string, unique)
- `username` (string, nullable)
- `profilePicture` (string, nullable)
- `signup_channel` (enum: 'manual', 'google')
- `password` (now nullable for Google OAuth users)

## API Usage

### Endpoint
```
POST /auth/google-oauth
```

### Request Body
```json
{
  "idToken": "google-id-token-from-frontend"
}
```

### Response (Success)
```json
{
  "message": "Login successful" | "Account created successfully with Google",
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "role": "User",
  "verification": true,
  "id": "user-uuid",
  "isNewUser": false | true
}
```

### Response (Error)
```json
{
  "message": "Invalid Google token" | "Google account email is not verified"
}
```

## Frontend Integration

### Using Google Sign-In JavaScript Library
```javascript
// Initialize Google Sign-In
google.accounts.id.initialize({
  client_id: 'your-google-client-id',
  callback: handleCredentialResponse
});

// Handle the response
function handleCredentialResponse(response) {
  // Send the ID token to your backend
  fetch('/auth/google-oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idToken: response.credential
    })
  })
  .then(response => response.json())
  .then(data => {
    // Handle successful authentication
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
  });
}
```

## Features

### User Management
- **New Users**: Creates new user account with Google profile information
- **Existing Users**: Links Google account to existing email-based account
- **Profile Pictures**: Automatically saves Google profile picture URL
- **Email Verification**: Google accounts are pre-verified

### Security
- Validates Google ID tokens server-side
- Requires verified Google email addresses
- Generates standard JWT tokens for session management
- Supports refresh token rotation

### Database Schema
The User model supports both traditional email/password and Google OAuth users:
- Traditional users: require password, email verification
- Google OAuth users: no password required, pre-verified, includes Google profile data

## Error Handling
- Invalid or expired Google tokens
- Unverified Google email addresses
- Database connection issues
- Token generation failures

## Testing
Use the Swagger documentation at `/api-docs` to test the Google OAuth endpoint with a valid Google ID token.
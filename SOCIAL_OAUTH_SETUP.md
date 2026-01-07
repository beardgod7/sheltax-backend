# Social OAuth Setup Guide

This guide explains how to set up Twitter and Facebook OAuth for the Sheltax backend application.

## Twitter OAuth Setup

### 1. Create Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for a developer account
3. Create a new project/app

### 2. Configure Twitter App
1. In your Twitter app dashboard:
   - Set app permissions to "Read and write"
   - Add callback URLs for your application
   - Note down your API keys

### 3. Environment Variables
Add these to your `.env` file:
```env
TWITTER_CONSUMER_KEY=your-twitter-consumer-key
TWITTER_CONSUMER_SECRET=your-twitter-consumer-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-access-token-secret
TWITTER_BEARER_TOKEN=your-twitter-bearer-token
```

### 4. Frontend Integration
Your frontend should:
1. Redirect user to Twitter OAuth URL
2. Handle the callback with `oauth_token` and `oauth_verifier`
3. Send these to `/auth/twitter-oauth` endpoint

## Facebook OAuth Setup

### 1. Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product

### 2. Configure Facebook App
1. In Facebook Login settings:
   - Add your domain to Valid OAuth Redirect URIs
   - Configure permissions (email, public_profile)
   - Note down App ID and App Secret

### 3. Environment Variables
Add these to your `.env` file:
```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### 4. Frontend Integration
Your frontend should:
1. Use Facebook SDK to get user access token
2. Send the access token to `/auth/facebook-oauth` endpoint

## API Endpoints

### Twitter OAuth
```
POST /auth/twitter-oauth
Content-Type: application/json

{
  "oauth_token": "twitter-oauth-token",
  "oauth_verifier": "twitter-oauth-verifier"
}
```

### Facebook OAuth
```
POST /auth/facebook-oauth
Content-Type: application/json

{
  "accessToken": "facebook-access-token"
}
```

## Response Format
All OAuth endpoints return:
```json
{
  "message": "Login successful",
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "role": "seeker",
  "verification": true,
  "id": "user-uuid",
  "isNewUser": false
}
```

## Database Migration
Run the migration to add social OAuth fields:
```sql
-- Run the migration file: migrations/add-social-oauth-fields.sql
```

## Security Notes
1. Always validate tokens on the server side
2. Store OAuth secrets securely
3. Use HTTPS in production
4. Implement rate limiting for OAuth endpoints
5. Consider implementing OAuth state parameter for CSRF protection

## Testing
1. Test with valid OAuth tokens
2. Test with invalid/expired tokens
3. Test user creation vs existing user login
4. Test error handling scenarios
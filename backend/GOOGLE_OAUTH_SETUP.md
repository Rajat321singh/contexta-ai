# 🔐 Google OAuth Setup Guide

Complete guide to set up Google OAuth 2.0 authentication for the Contexta application.

---

## 📋 Overview

Google OAuth allows users to sign in with their Google account without sharing passwords. This guide covers:
- Creating a Google Cloud Project
- Setting up OAuth 2.0 credentials
- Configuring redirect URIs
- Adding credentials to your application

---

## Step 1: Create a Google Cloud Project

### 1.1 Go to Google Cloud Console
1. Visit **[Google Cloud Console](https://console.cloud.google.com/)**
2. Sign in with your Google account

### 1.2 Create a New Project
1. Click the **Project selector** dropdown (top-left corner)
2. Click **NEW PROJECT**
3. Enter project name: `Contexta` (or your preferred name)
4. Click **CREATE**
5. Wait for project creation to complete (1-2 minutes)

### 1.3 Select Your Project
- Once created, click the project selector again
- Select your new **Contexta** project

---

## Step 2: Enable Google+ API

### 2.1 Navigate to APIs
1. In the left sidebar, go to **APIs & Services**
2. Click **Library**

### 2.2 Search for Google+ API
1. In the search bar, type: `Google+ API`
2. Click on **Google+ API** in results
3. Click **ENABLE**

Wait for the API to be enabled (30 seconds - 1 minute)

---

## Step 3: Create OAuth 2.0 Credentials

### 3.1 Create OAuth Consent Screen
1. In left sidebar, click **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for testing) or **Internal** (for organization)
   - **External**: Anyone with a Google account can sign in
   - **Internal**: Only users in your organization
3. Click **CREATE**

### 3.2 Fill Out Consent Screen
**App Information:**
- **App name**: Contexta
- **User support email**: your-email@gmail.com
- **Developer contact**: your-email@gmail.com

**Scopes** (Optional but recommended):
1. Click **ADD OR REMOVE SCOPES**
2. Add these scopes:
   - `email` - Get user's email address
   - `profile` - Get user's profile (name, picture)
3. Click **UPDATE**

**Test Users** (if External):
1. Click **ADD USERS**
2. Add email addresses of testers
3. Click **ADD**

**Save:**
Click **SAVE AND CONTINUE**

---

## Step 4: Create OAuth Credentials

### 4.1 Create Credential
1. In left sidebar, click **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth client ID**

### 4.2 Configure OAuth Client
1. **Application type**: Select `Web application`
2. **Name**: `Contexta Web Client` (or your preference)
3. **Authorized redirect URIs**: Add these:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/api/auth/google/callback
   https://yourdomain.com/auth/callback
   https://yourdomain.com/api/auth/google/callback
   ```
   (Replace `yourdomain.com` with your actual domain in production)

4. Click **CREATE**

---

## Step 5: Copy Your Credentials

After clicking CREATE, you'll see a popup with your credentials:

```json
{
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "client_secret": "YOUR_CLIENT_SECRET"
}
```

**⚠️ IMPORTANT:**
- **Client ID**: Safe to share (use in frontend)
- **Client Secret**: NEVER share or commit to Git (use only in backend)

### Copy the Credentials:
1. **Client ID**: Click copy button
2. **Client Secret**: Click copy button
3. Save to your `.env` file (see next step)

**Or download as JSON:**
1. Click the download icon (↓)
2. A file `client_secret_*.json` will download
3. Keep this file safe and secret!

---

## Step 6: Add to Environment Variables

### Backend (.env)
Create or update your `.env` file in the backend folder:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

### Frontend (.env or .env.local)
Create or update your frontend `.env` file:

```env
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

**🔒 Security:**
- Add `.env` to `.gitignore` (never commit secrets)
- Never expose `GOOGLE_CLIENT_SECRET` in frontend code

---

## Step 7: Verify Configuration

### Check in Google Cloud Console:
1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 credential
3. Verify the redirect URIs are correct:
   ```
   ✓ http://localhost:3000/auth/callback
   ✓ http://localhost:5000/api/auth/google/callback
   ```

---

## Implementation Examples

### Backend (Node.js/Express)

```javascript
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate authorization URL
app.get('/api/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
  });
  res.redirect(authUrl);
});

// Handle callback
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  // Store tokens and create user session
});
```

### Frontend (React)

```jsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          console.log(credentialResponse);
          // Send token to backend for verification
        }}
        onError={() => console.log('Login Failed')}
      />
    </GoogleOAuthProvider>
  );
}
```

---

## Redirect URI Cheat Sheet

| Environment | Frontend URI | Backend URI |
|-------------|-------------|------------|
| **Local Dev** | `http://localhost:3000/auth/callback` | `http://localhost:5000/api/auth/google/callback` |
| **Production** | `https://app.yourdomain.com/auth/callback` | `https://api.yourdomain.com/api/auth/google/callback` |
| **Staging** | `https://staging.yourdomain.com/auth/callback` | `https://staging-api.yourdomain.com/api/auth/google/callback` |

⚠️ **Must match exactly** in Google Cloud Console

---

## Troubleshooting

### Error: "Redirect URI mismatch"
**Cause:** The redirect URI in your code doesn't match Google Cloud Console

**Solution:**
1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 credential
3. Check **Authorized redirect URIs** match your application exactly
4. Include protocol (http/https), domain, and path

### Error: "Invalid client_id"
**Cause:** Client ID is incorrect or malformed

**Solution:**
1. Copy Client ID from Google Cloud Console (exactly)
2. Paste into `.env` file
3. Restart your application

### Error: "access_denied"
**Cause:** User is not in test users list (if using External consent)

**Solution:**
1. Go to **OAuth consent screen** in Google Cloud Console
2. Add user email to **Test Users**
3. Ask user to try signing in again

### Error: "Client ID of type web application is not configured for OAuth 2.0"
**Cause:** OAuth consent screen not fully configured

**Solution:**
1. Go to **OAuth consent screen**
2. Complete all required fields
3. Click **SAVE AND CONTINUE**
4. Return to Credentials and create OAuth client again

---

## Production Checklist

- [ ] Use `https://` for all redirect URIs
- [ ] Add production domain to redirect URIs in Google Cloud Console
- [ ] Store credentials in environment variables (not hardcoded)
- [ ] Add `.env` to `.gitignore`
- [ ] Use `GOOGLE_CLIENT_SECRET` only on backend
- [ ] Set consent screen to "Internal" for organization users only
- [ ] Test login flow end-to-end
- [ ] Verify tokens are properly validated on backend
- [ ] Set up token refresh mechanism
- [ ] Monitor OAuth API quotas in Google Cloud Console

---

## Useful Links

- **Google Cloud Console**: https://console.cloud.google.com/
- **Google OAuth Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Google Auth Library (Node.js)**: https://github.com/googleapis/google-api-nodejs-client
- **Google OAuth for React**: https://www.npmjs.com/package/@react-oauth/google
- **OAuth 2.0 Scopes**: https://developers.google.com/identity/protocols/oauth2/scopes

---

## Security Notes

⚠️ **NEVER:**
- Commit `.env` files to Git
- Share your `GOOGLE_CLIENT_SECRET`
- Expose credentials in frontend code
- Log sensitive credentials

✅ **DO:**
- Use environment variables for all credentials
- Validate tokens on backend
- Rotate credentials regularly
- Use HTTPS in production
- Keep dependencies updated

---

## Next Steps

1. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to your `.env`
2. Install required packages:
   ```bash
   npm install google-auth-library
   npm install @react-oauth/google  # if using React
   ```
3. Implement Google login in your application
4. Test locally with redirect URI: `http://localhost:3000/auth/callback`
5. Deploy with production redirect URIs

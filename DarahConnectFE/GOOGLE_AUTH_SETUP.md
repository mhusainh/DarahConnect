# Google Authentication Setup - DarahConnect

## Overview
DarahConnect now supports Google authentication for both login and registration, allowing users to quickly sign up and sign in using their Google accounts.

## Features Implemented

### 1. **useGoogleAuth Hook** (`src/hooks/useGoogleAuth.ts`)
Custom React hook that manages Google authentication using Google Identity Services API.

**Features:**
- Automatic Google Identity Services script loading
- JWT token decoding for user information
- Local storage persistence
- Sign-in and sign-out functionality
- Auto-reconnection on app refresh

**Usage:**
```typescript
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const { isLoaded, signIn, signOut, user, isSignedIn } = useGoogleAuth();
```

### 2. **GoogleSignInButton Component** (`src/components/GoogleSignInButton.tsx`)
Reusable Google Sign-In button component with official Google branding.

**Features:**
- Official Google colors and icon
- Loading states
- Customizable text
- Success/error callbacks
- Responsive design

**Props:**
```typescript
interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  text?: string;
  disabled?: boolean;
  className?: string;
}
```

### 3. **Updated Login Page** (`src/pages/LoginPage.tsx`)
Enhanced login page with Google authentication option.

**New Features:**
- Google Sign-In button below regular login form
- Divider with "Atau" (Or) text
- Automatic redirect after successful Google login
- Error handling for Google authentication failures

### 4. **Updated Register Page** (`src/pages/RegisterPage.tsx`)
Enhanced registration page with Google authentication option.

**New Features:**
- Google Sign-In button in Step 1 (Account Information)
- Auto-fills name and email from Google account
- Divider with "Atau daftar dengan" (Or register with) text
- Automatic success modal after Google registration

## How It Works

### Authentication Flow:
1. **User clicks Google Sign-In button**
2. **Google Identity Services popup appears**
3. **User selects Google account and grants permissions**
4. **JWT token received from Google**
5. **Token decoded to extract user information**
6. **User data stored in localStorage**
7. **User redirected to dashboard**

### Data Stored:
```javascript
localStorage.setItem('googleUser', JSON.stringify(googleUser));
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('userEmail', googleUser.email);
localStorage.setItem('userName', googleUser.name);
localStorage.setItem('authMethod', 'google');
```

### User Information Available:
```typescript
interface GoogleUser {
  id: string;          // Google user ID
  name: string;        // Full name
  email: string;       // Email address
  picture: string;     // Profile picture URL
  given_name: string;  // First name
  family_name: string; // Last name
}
```

## Configuration

### Google Client ID
Currently using a demo client ID for testing:
```
1058825053423-ckc3s54kh7mblj4bsm06i6j5e5l6n6j5.apps.googleusercontent.com
```

### For Production Setup:
1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Identity Services:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Identity" and enable it

3. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized domains (your production domain)

4. **Configure JavaScript Origins:**
   ```
   http://localhost:3000 (for development)
   https://your-domain.com (for production)
   ```

5. **Update Client ID:**
   Replace the demo client ID in `src/hooks/useGoogleAuth.ts`

## Security Features

### Data Protection:
- JWT tokens are processed client-side only
- No sensitive Google tokens stored in localStorage
- Automatic token cleanup on sign-out
- Cancel on tap outside for popup

### Authentication Method Tracking:
- `authMethod` stored to differentiate Google vs email auth
- Helps with logout and session management
- Useful for analytics and user experience

## UI/UX Features

### Visual Design:
- Official Google branding and colors
- Consistent with Material Design guidelines
- Responsive button design
- Loading states and error handling

### User Experience:
- One-click authentication
- Auto-fill registration forms
- Seamless redirect flow
- Clear error messages in Indonesian

## Testing

### Demo Functionality:
- Works with any Google account
- Immediate authentication response
- Auto-redirect to dashboard
- Persistent sessions across browser refresh

### Error Handling:
- Network connectivity issues
- Google popup blocked
- Authentication cancellation
- Invalid or expired tokens

## Future Enhancements

### Potential Improvements:
1. **Profile Picture Integration:** Display Google profile pictures
2. **Two-Factor Authentication:** Enhanced security options
3. **Account Linking:** Connect Google account to existing email account
4. **Social Features:** Friend suggestions from Google contacts
5. **Google Calendar:** Integration for donation appointments

### Analytics Integration:
- Track Google vs email registration rates
- Monitor authentication success/failure rates
- User engagement metrics by auth method

## Troubleshooting

### Common Issues:

**1. Google Popup Blocked:**
- Ensure popup blockers are disabled
- Check browser security settings

**2. Client ID Not Working:**
- Verify client ID is correct
- Check authorized domains in Google Console

**3. CORS Issues:**
- Ensure domain is authorized in Google Console
- Check for HTTPS in production

**4. Token Errors:**
- Clear localStorage and try again
- Check browser developer console for errors

### Debug Information:
Enable console logging to see authentication flow:
```javascript
console.log('Google sign-in successful:', googleUser);
```

## Support

For issues related to Google authentication integration, check:
1. Browser developer console for error messages
2. Google Cloud Console for credential configuration
3. Network tab for API request failures
4. Application localStorage for stored user data

---

**Last Updated:** June 2025  
**Version:** 1.0.0  
**Author:** DarahConnect Development Team 
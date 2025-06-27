# 📧 Email Verification System - DarahConnect

## 🔗 How the Email Verification Flow Works

### 1. User Registration
- User registers on `/register` page
- Form data sent to `POST /register` API
- Backend sends verification email to user
- User sees "Check Your Email" modal

### 2. Email Content Structure
The email sent by backend should contain a verification link like this:

```
https://yourapp.com/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Email Template Example (HTML)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verifikasi Email - DarahConnect</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🩸 DarahConnect</h1>
            <h2>Verifikasi Email Anda</h2>
        </div>
        
        <div class="content">
            <h3>Halo {{USER_NAME}}!</h3>
            
            <p>Terima kasih telah mendaftar di DarahConnect. Untuk mengaktifkan akun Anda dan mulai berkontribusi dalam menyelamatkan nyawa, silakan verifikasi email Anda dengan mengklik tombol di bawah ini:</p>
            
            <div style="text-align: center;">
                <a href="{{VERIFICATION_LINK}}" class="button">
                    ✅ Verifikasi Email Saya
                </a>
            </div>
            
            <p><strong>Atau copy paste link berikut ke browser:</strong><br>
            <a href="{{VERIFICATION_LINK}}">{{VERIFICATION_LINK}}</a></p>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #1565c0;">
                    <strong>🔐 Keamanan:</strong> Link ini hanya berlaku selama 24 jam untuk keamanan akun Anda.
                </p>
            </div>
            
            <p>Setelah verifikasi berhasil, Anda akan:</p>
            <ul>
                <li>✅ Otomatis login ke akun DarahConnect</li>
                <li>🩸 Dapat mulai mendonorkan darah</li>
                <li>📋 Melengkapi profil donor</li>
                <li>🏆 Mendapatkan sertifikat donor</li>
            </ul>
            
            <p>Jika Anda tidak mendaftar di DarahConnect, abaikan email ini.</p>
            
            <p>Salam hangat,<br>
            <strong>Tim DarahConnect</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2024 DarahConnect. Platform donor darah terpercaya Indonesia.</p>
            <p>Email ini dikirim otomatis, mohon tidak membalas.</p>
        </div>
    </div>
</body>
</html>
```

### 4. Backend API Endpoints Required

#### Register Endpoint
```
POST /register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "gender": "Male",
  "email": "john@example.com", 
  "password": "password123",
  "phone": "081234567890",
  "blood_type": "A+",
  "birth_date": "1995-05-15T00:00:00Z",
  "address": "Jl. Sudirman No. 123, Jakarta"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "user_id": "123",
    "email": "john@example.com"
  }
}
```

#### Email Verification Endpoint
```
GET /verify-email?token=<verification_token>
```

**Success Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Login token
    "user": {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com",
      "email_verified": true
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid or expired verification token",
  "meta": {
    "message": "Token tidak valid atau sudah kadaluarsa"
  }
}
```

### 5. Frontend Flow Summary

1. **Register Page** (`/register`):
   - User fills form
   - POST to `/register` API
   - Show "Check Email" modal
   - User clicks "Open Gmail" button

2. **User checks email**:
   - Clicks verification link in email
   - Link format: `https://yourapp.com/verify-email?token=abc123`

3. **Verification Page** (`/verify-email`):
   - Automatically extracts token from URL
   - Calls `GET /verify-email?token=abc123`
   - If successful:
     - Save login token to localStorage
     - Save user data to localStorage
     - Show success message
     - Auto-redirect to dashboard after 3 seconds
   - If error:
     - Show error message
     - Provide retry/login options

### 6. URL Examples

**Verification Link in Email:**
```
https://yourapp.com/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwiZXhwIjoxNjk5ODQwODAwfQ.signature
```

**After Verification Success:**
```
Redirect to: https://yourapp.com/dashboard
```

### 7. Token Storage

**LocalStorage Keys:**
- `authToken`: JWT token for API authentication
- `userData`: User profile data as JSON string
- `isLoggedIn`: "true" if user is authenticated

### 8. Error Handling

**Common Error Scenarios:**
- ❌ Token missing from URL
- ❌ Token expired (24h limit)
- ❌ Token already used
- ❌ Invalid token format
- ❌ Network connection issues
- ❌ Server errors

**User Experience:**
- Clear error messages in Indonesian
- Retry verification button
- Option to resend verification email
- Fallback to manual login
- Support contact information

### 9. Security Considerations

1. **Token Expiration**: 24 hours maximum
2. **Single Use**: Token invalidated after successful verification
3. **HTTPS Only**: All verification links must use HTTPS
4. **Rate Limiting**: Limit verification attempts per IP
5. **Email Validation**: Verify email format and domain

### 10. Testing

**Test Scenarios:**
```javascript
// Valid token
GET /verify-email?token=valid_token_here
// Expected: Success response with login token

// Expired token  
GET /verify-email?token=expired_token_here
// Expected: Error response

// Invalid token
GET /verify-email?token=invalid_token_here  
// Expected: Error response

// Missing token
GET /verify-email
// Expected: Error response
```

**Frontend Testing:**
1. Register new user → Check email modal appears
2. Click verification link → Redirected to verification page
3. Successful verification → Auto-login and redirect to dashboard
4. Invalid token → Error message with retry options
5. Network error → Proper error handling

---

## 🎯 Implementation Checklist

### Backend Tasks:
- [ ] Create POST /register endpoint
- [ ] Implement email sending service
- [ ] Create GET /verify-email endpoint  
- [ ] Generate and validate JWT tokens
- [ ] Set up email templates
- [ ] Add rate limiting
- [ ] Implement token expiration

### Frontend Tasks:
- [x] Create EmailVerificationPage component
- [x] Add verification route to App.tsx
- [x] Update RegisterPage email modal
- [x] Implement token extraction from URL
- [x] Add error handling and retry logic
- [x] Set up localStorage token management
- [x] Create success/error UI states

### Integration:
- [ ] Test end-to-end verification flow
- [ ] Verify token storage and authentication
- [ ] Test error scenarios
- [ ] Mobile responsiveness
- [ ] Email client compatibility

This verification system provides a seamless, secure experience for users while maintaining strong security practices! 🚀 
# 📧 RecoVibe Email System - Quick Reference Card

## 🚀 Quick Start (Copy & Paste)

### Installation
```bash
npm install nodemailer dotenv
```

### Configure (.env)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Start Server
```bash
node server.js
```

---

## 📨 API Endpoints Quick Reference

### 1. Send Invitation
```javascript
await fetch('/api/email/send-invitation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: 'user@example.com',
    userType: 'basic', // or 'admin'
    eventData: {
      eventName: 'Event Name',
      eventDate: '2025-03-15',
      eventLocation: 'Location',
      eventLink: 'http://...',
      organizer: 'Organization Name'
    }
  })
});
```

### 2. Send Approval
```javascript
await fetch('/api/email/send-approval', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: 'user@example.com',
    userType: 'basic',
    approvalData: {
      eventName: 'Event Name',
      status: 'Approved', // or 'Rejected'
      approverName: 'Admin Name',
      notes: 'Optional notes'
    }
  })
});
```

### 3. Send Update
```javascript
await fetch('/api/email/send-update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: 'user@example.com',
    userType: 'basic',
    updateData: {
      eventName: 'Event Name',
      updateType: 'Location Changed',
      updateDetails: 'New location details',
      eventLink: 'http://...'
    }
  })
});
```

### 4. Send RSVP Confirmation
```javascript
await fetch('/api/email/send-rsvp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: 'user@example.com',
    userType: 'basic',
    rsvpData: {
      eventName: 'Event Name',
      eventDate: '2025-03-15',
      eventTime: '2:00 PM',
      eventLocation: 'Location'
    }
  })
});
```

### 5. Send Bulk Email
```javascript
await fetch('/api/email/send-bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipients: [
      { email: 'user1@example.com', userType: 'basic' },
      { email: 'admin@example.com', userType: 'admin' }
    ],
    emailType: 'invitation', // 'invitation', 'approval', 'update', 'rsvp'
    emailData: { /* event data */ }
  })
});
```

---

## 🎯 Common Integration Points

### RSVP Click Handler (ai.html)
```javascript
// After successful RSVP
const user = firebase.auth().currentUser;
const event = doc.data();

await fetch('/api/email/send-rsvp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: user.email,
    userType: 'basic',
    rsvpData: {
      eventName: event.name,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location
    }
  })
});
```

### Event Creation Handler
```javascript
// After creating event
const creatorEmail = firebase.auth().currentUser.email;

// Notify admin
await fetch('/api/email/send-invitation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: 'admin@university.edu',
    userType: 'admin',
    eventData: {
      eventName: eventData.name,
      eventDate: eventData.date,
      eventLocation: eventData.location,
      eventLink: `${window.location.origin}/event/${eventId}`,
      organizer: creatorEmail
    }
  })
});
```

### Admin Approval Handler
```javascript
// When admin approves event
const approverName = 'Dr. Admin Name';

await fetch('/api/email/send-approval', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: eventCreatorEmail,
    userType: 'basic',
    approvalData: {
      eventName: eventData.name,
      status: 'Approved',
      approverName: approverName,
      notes: 'Your event has been approved!'
    }
  })
});
```

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "messageId": "<message@example.com>"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

### Bulk Response
```json
{
  "success": true,
  "results": [
    { "email": "user1@example.com", "success": true, "messageId": "..." },
    { "email": "user2@example.com", "success": false, "error": "..." }
  ]
}
```

---

## 🔧 Setup Checklist

- [ ] Run `npm install nodemailer dotenv`
- [ ] Create `.env` file with email credentials
- [ ] Run `npm run test-email` to verify setup
- [ ] Update `server.js` (already done!)
- [ ] Create `emailService.js` (already done!)
- [ ] Add email calls to your event handlers
- [ ] Test with your own email first
- [ ] Deploy to production

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find nodemailer" | `npm install nodemailer` |
| Email not sending | Check `.env` credentials |
| "Invalid login" | Use Gmail App Password, not regular password |
| 403 Forbidden | Verify email address format |

---

## 📁 File Structure

```
rec-vibe-1/
├── emailService.js          ← Backend email service
├── server.js                ← Express server with email endpoints
├── package.json             ← Dependencies
├── .env                     ← Email credentials (not committed)
├── .env.example             ← Template
├── EMAIL_DOCUMENTATION.md   ← Full docs
├── EMAIL_SETUP_GUIDE.md     ← Setup guide
├── EMAIL_SUMMARY.md         ← This file
└── html/
    ├── emailClient.js       ← Frontend utility
    ├── emailExamples.js     ← Code examples
    ├── emailLogging.js      ← Firebase logging
    └── ai.html              ← Main page
```

---

## 📧 Email Types Summary

| Type | Basic User Gets | Admin Gets |
|------|-----------------|-----------|
| **Invitation** | Welcome + event details | Review request |
| **Approval** | Confirmation + status | Status alert |
| **Update** | Change notification | Impact report |
| **RSVP** | Confirmation + details | Attendance count |

---

## 💾 Firebase Logging (Optional)

### Log an Email
```javascript
import { logEmailToFirebase } from './emailLogging.js';

await logEmailToFirebase({
  recipientEmail: 'user@example.com',
  userType: 'basic',
  emailType: 'rsvp',
  eventId: 'event-123',
  eventName: 'Tech Summit',
  status: 'sent',
  messageId: 'msg-456'
});
```

### Get Statistics
```javascript
import { getEmailStats } from './emailLogging.js';

const stats = await getEmailStats('week');
console.log(`✅ Sent: ${stats.successCount}, ❌ Failed: ${stats.failureCount}`);
```

---

## 🔒 Security Reminders

✅ Add `.env` to `.gitignore`
✅ Use Gmail App Passwords (not regular password)
✅ Enable 2-factor authentication
✅ Never commit credentials
✅ Validate email addresses
✅ Implement rate limiting

---

## 📞 Help & Documentation

- **Full Docs**: See `EMAIL_DOCUMENTATION.md` (270+ lines)
- **Setup Guide**: See `EMAIL_SETUP_GUIDE.md` (150+ lines)
- **Code Examples**: See `emailExamples.js` (8 scenarios)
- **Firebase Integration**: See `emailLogging.js` (analytics)

---

## ✨ You're All Set!

Your RecoVibe email system is ready to use. Start by testing with your own email, then integrate into your event handlers.

**Happy emailing! 🎉**

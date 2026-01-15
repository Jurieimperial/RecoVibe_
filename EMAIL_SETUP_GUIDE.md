# RecoVibe Email System - Quick Setup Guide

## 📋 Prerequisites
- Node.js and npm installed
- An email account (Gmail recommended)
- Access to your RecoVibe project

## ⚡ Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd c:\Users\Rhodora\RecoVibe_\Legit-na-to-1\rec-vibe-1
npm install nodemailer dotenv
```

### Step 2: Configure Email Credentials

**For Gmail:**
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Select "Security" from the left menu
3. Enable "2-Step Verification" if not already enabled
4. Go to "App passwords" (appears after 2-step is enabled)
5. Select "Mail" and "Windows Computer"
6. Google will generate a 16-character password

**Create `.env` file** in your project root:
```bash
# File: c:\Users\Rhodora\RecoVibe_\Legit-na-to-1\rec-vibe-1\.env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

⚠️ **IMPORTANT:** Add `.env` to your `.gitignore` to prevent exposing credentials!

### Step 3: Test the Setup
Run this test script to verify everything works:

```bash
node -e "
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email is ready to send!');
  }
});
"
```

### Step 4: Start Your Server
```bash
node server.js
```

You should see: `Server started on http://localhost:3000`

---

## 🔄 Integration Points

### In `ai.html` - RSVP Handler
Find this in your RSVP button click handler and add the email call:

```javascript
// After successful RSVP to Firestore, add:
const user = firebase.auth().currentUser;
const eventData = doc.data();

// Send confirmation email
await fetch('/api/email/send-rsvp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: user.email,
    userType: 'basic',
    rsvpData: {
      eventName: eventData.name,
      eventDate: eventData.date,
      eventTime: eventData.time,
      eventLocation: eventData.location
    }
  })
});
```

### In `createEvent.js` - After Event Creation
Add email notification:

```javascript
// After event is created in Firestore
const eventId = doc.id;
const creatorEmail = firebase.auth().currentUser.email;

// Notify creator and admin
await fetch('/api/email/send-invitation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: 'admin@your-university.edu',
    userType: 'admin',
    eventData: {
      eventName: eventData.name,
      eventDate: eventData.date,
      eventLocation: eventData.location,
      eventLink: `http://localhost:3000/event/${eventId}`,
      organizer: creatorEmail
    }
  })
});
```

### In `dashboardforadmin.html` - Approval Actions
Add email on approval:

```javascript
// When admin clicks "Approve"
const approverName = 'Admin Name'; // Get from logged-in user
await fetch('/api/email/send-approval', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: eventData.creatorEmail,
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

## 📧 Available Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/email/send-invitation` | POST | Send event invitations |
| `/api/email/send-approval` | POST | Send approval notifications |
| `/api/email/send-update` | POST | Send event updates |
| `/api/email/send-rsvp` | POST | Send RSVP confirmations |
| `/api/email/send-bulk` | POST | Send bulk emails to multiple users |

---

## 🎨 Email Templates by User Type

### Basic User Templates
- ✉️ **Invitation** → Friendly welcome with event details
- ✅ **Approval** → Confirmation that their event was approved
- 📢 **Update** → Alert about event changes
- ✔️ **RSVP** → Confirmation of attendance

### Admin User Templates
- 📋 **Invitation** → Review request with action button
- 🔔 **Approval** → Status change notification
- ⚠️ **Update** → Alert with attendee impact
- 📊 **RSVP** → Attendance tracking metric

---

## 🛠️ Common Issues & Solutions

### ❌ "Error: connect ECONNREFUSED"
**Cause:** Incorrect email credentials
**Solution:** 
- Verify your email and app password in `.env`
- For Gmail, ensure you're using the 16-character App Password, not your regular password
- Run the test script above to verify

### ❌ "Failed to send emails"
**Cause:** Server not running or email endpoint not found
**Solution:**
- Ensure `server.js` is running with `node server.js`
- Check that `emailService.js` is in the project root
- Verify `.env` file exists

### ❌ "Missing required fields"
**Cause:** Request body doesn't include all required parameters
**Solution:**
- Check the endpoint documentation above
- Include all required fields in the request
- Log the request to see what's missing

---

## 📚 Documentation Files

- **EMAIL_DOCUMENTATION.md** - Complete API reference and templates
- **emailService.js** - Backend email service
- **emailClient.js** - Frontend utility for calling email APIs
- **emailExamples.js** - Real-world usage examples

---

## 🚀 Next Steps

1. ✅ Install dependencies
2. ✅ Configure `.env` with email credentials
3. ✅ Test with the verification script
4. ✅ Start the server
5. ✅ Integrate email calls into your pages
6. ✅ Test with your own email
7. ✅ Deploy to production

---

## 💡 Pro Tips

1. **Test First** - Always test emails with your own email before sending to users
2. **Use Bulk for Performance** - When sending to many users, use the bulk endpoint
3. **Error Logging** - Log failed email sends for debugging
4. **Rate Limiting** - Add delays between bulk sends to avoid SMTP rate limits
5. **Personalization** - Use user names and relevant details in emails

---

## 📞 Support

For issues or questions:
1. Check the **EMAIL_DOCUMENTATION.md** file
2. Review the **emailExamples.js** for working code
3. Check server logs for error messages
4. Verify `.env` configuration

---

**You're all set! 🎉 Happy emailing!**

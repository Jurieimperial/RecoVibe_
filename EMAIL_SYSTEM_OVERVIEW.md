# 📧 RecoVibe Email System - Visual Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERACTIONS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📝 Create Event  │  🔔 RSVP Event  │  ✅ Approve Event       │
│                                                                 │
└────────────┬──────────────────────┬──────────────────────┬─────┘
             │                      │                      │
             ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              JAVASCRIPT EVENT HANDLERS (HTML/JS)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Click RSVP → Handle Event → Call Email API                    │
│  Create Event → Store Data → Call Email API                    │
│  Approve Event → Update DB → Call Email API                    │
│                                                                 │
└────────────┬──────────────────────┬──────────────────────┬─────┘
             │                      │                      │
             ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│           EMAIL API CALLS (fetch to /api/email/...)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST /api/email/send-invitation    → Invite users            │
│  POST /api/email/send-approval      → Notify approval         │
│  POST /api/email/send-update        → Alert of changes        │
│  POST /api/email/send-rsvp          → Confirm attendance      │
│  POST /api/email/send-bulk          → Mass emails             │
│                                                                 │
└────────────┬──────────────────────┬──────────────────────┬─────┘
             │                      │                      │
             ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│          EXPRESS SERVER ENDPOINTS (server.js)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Receive request → Validate data → Call emailService           │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │    EMAILSERVICE.JS                     │
        ├────────────────────────────────────────┤
        │                                        │
        │  Choose Template                       │
        │  ├─ Invitation (basic/admin)           │
        │  ├─ Approval (basic/admin)             │
        │  ├─ Update (basic/admin)               │
        │  └─ RSVP (basic/admin)                 │
        │                                        │
        │  Build HTML Email                      │
        │  Set Subject & Content                 │
        │  Format Recipient                      │
        │                                        │
        └────────────┬─────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │    NODEMAILER                          │
        ├────────────────────────────────────────┤
        │                                        │
        │  Connect to SMTP Server (Gmail, etc)   │
        │  Authenticate with Credentials         │
        │  Send Email via Internet               │
        │  Return Message ID or Error            │
        │                                        │
        └────────────┬─────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │    SMTP SERVER (Gmail, Outlook, etc)   │
        ├────────────────────────────────────────┤
        │  Receive email from our app            │
        │  Validate & Process                    │
        │  Send to recipient's inbox             │
        └────────────┬─────────────────────────┘
                     │
                     ▼
              📧 EMAIL RECEIVED
              by User
```

---

## File Organization Map

```
PROJECT ROOT
│
├─ Backend Files
│  ├─ emailService.js              🔴 MAIN SERVICE
│  ├─ server.js                    🟢 EXPRESS SERVER (UPDATED)
│  ├─ package.json                 🔵 DEPENDENCIES (UPDATED)
│  ├─ .env                         🔒 CREDENTIALS (CREATE THIS)
│  └─ .env.example                 📋 TEMPLATE
│
├─ Documentation
│  ├─ EMAIL_QUICK_REFERENCE.md     ⭐ START HERE
│  ├─ EMAIL_SETUP_GUIDE.md         📖 SETUP INSTRUCTIONS
│  ├─ EMAIL_DOCUMENTATION.md       📚 COMPLETE API REFERENCE
│  ├─ EMAIL_SUMMARY.md             📝 IMPLEMENTATION OVERVIEW
│  ├─ EMAIL_RESOURCE_INDEX.md      🗂️ FILE INDEX
│  └─ EMAIL_SYSTEM_OVERVIEW.md     👈 YOU ARE HERE
│
└─ html/ (Frontend)
   ├─ emailClient.js               🟡 FRONTEND UTILITY
   ├─ emailExamples.js             💡 CODE EXAMPLES
   ├─ emailLogging.js              📊 FIREBASE TRACKING
   ├─ ai.html                      🎨 MAIN PAGE
   ├─ createevent.html             ➕ CREATE EVENT
   └─ dashboardforadmin.html       👨‍💼 ADMIN DASHBOARD
```

---

## API Endpoint Summary

```
┌─────────────────────────────────────────────────────────────┐
│                   EMAIL API ENDPOINTS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SEND INVITATION                                        │
│     POST /api/email/send-invitation                        │
│     Purpose: Invite user to event                          │
│     Templates: Basic (Friendly) | Admin (Review)           │
│                                                             │
│  2. SEND APPROVAL                                          │
│     POST /api/email/send-approval                          │
│     Purpose: Notify about approval/rejection               │
│     Templates: Basic (Status) | Admin (Alert)              │
│                                                             │
│  3. SEND UPDATE                                            │
│     POST /api/email/send-update                            │
│     Purpose: Alert about event changes                     │
│     Templates: Basic (Details) | Admin (Impact)            │
│                                                             │
│  4. SEND RSVP                                              │
│     POST /api/email/send-rsvp                              │
│     Purpose: Confirm attendance                            │
│     Templates: Basic (Confirm) | Admin (Metric)            │
│                                                             │
│  5. SEND BULK                                              │
│     POST /api/email/send-bulk                              │
│     Purpose: Send to multiple users                        │
│     Types: All of the above                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Email Template Types Matrix

```
┌──────────────┬────────────────────┬─────────────────────┐
│ EMAIL TYPE   │ BASIC USER         │ ADMIN USER          │
├──────────────┼────────────────────┼─────────────────────┤
│ INVITATION   │ 🎉 Welcome         │ 📋 Review Request   │
│              │ Event Details      │ Organizer Info      │
│              │ "View Event" Link  │ "Review & Approve"  │
│              │ Friendly Tone      │ Professional Tone   │
├──────────────┼────────────────────┼─────────────────────┤
│ APPROVAL     │ ✅ Status Update   │ 🔔 Status Alert     │
│              │ Approver Name      │ Previous Status     │
│              │ Optional Notes     │ Action Taker        │
│              │ Success Message    │ Notification Tone   │
├──────────────┼────────────────────┼─────────────────────┤
│ UPDATE       │ 📢 Change Notice   │ ⚠️ Change Alert     │
│              │ What Changed       │ Detailed Change Log │
│              │ Event Link         │ Attendee Count      │
│              │ Simple Format      │ Administrative      │
├──────────────┼────────────────────┼─────────────────────┤
│ RSVP         │ ✔️ Confirmation    │ 📊 Attendance Data  │
│              │ Event Details      │ Attendee Name       │
│              │ Calendar Reminder  │ RSVP Count          │
│              │ Celebratory Tone   │ Summary Format      │
└──────────────┴────────────────────┴─────────────────────┘
```

---

## Setup Flow Diagram

```
┌─────────────────────────────────────────┐
│ START: RecoVibe Email Setup             │
└────────────────┬────────────────────────┘
                 │
    ┌────────────▼──────────┐
    │ Install Dependencies  │
    │ npm install nodemailer│
    │ npm install dotenv    │
    └────────────┬──────────┘
                 │
    ┌────────────▼──────────┐
    │ Configure Gmail       │
    │ - Enable 2FA          │
    │ - Generate App Pass   │
    │ - Create .env file    │
    └────────────┬──────────┘
                 │
    ┌────────────▼──────────┐
    │ Test Setup            │
    │ npm run test-email    │
    │ (Verify credentials)  │
    └────────────┬──────────┘
                 │
    ┌────────────▼──────────┐
    │ Start Server          │
    │ node server.js        │
    └────────────┬──────────┘
                 │
    ┌────────────▼──────────┐
    │ Test Email Sending    │
    │ Send test email to    │
    │ your own inbox        │
    └────────────┬──────────┘
                 │
    ┌────────────▼──────────┐
    │ Integrate into App    │
    │ Add email calls to:   │
    │ - RSVP handler        │
    │ - Create event        │
    │ - Approve event       │
    └────────────┬──────────┘
                 │
    ┌────────────▼──────────┐
    │ Deploy to Production  │
    │ Push to server        │
    │ Set .env on server    │
    └────────────┬──────────┘
                 │
    ┌────────────▼──────────┐
    │ DONE! ✅              │
    │ Emails now working    │
    └──────────────────────┘
```

---

## Integration Points in Your App

```
┌─────────────────────────────────────────────────────────┐
│               YOUR RECOVIBE APP                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📱 AI.HTML (Main Page)                               │
│  └─ RSVP Button Click                                 │
│     └─ Call: /api/email/send-rsvp                     │
│        └─ Send confirmation to attendee + admin       │
│                                                         │
│  ➕ CREATEEVENT.HTML (Event Creation)                  │
│  └─ Create Button Click                               │
│     └─ Call: /api/email/send-invitation               │
│        └─ Send to admin for review                    │
│                                                         │
│  👨‍💼 DASHBOARDFORADMIN.HTML (Admin Panel)             │
│  └─ Approve Button Click                              │
│     ├─ Call: /api/email/send-approval                 │
│     │  └─ Notify creator (basic)                      │
│     └─ Call: /api/email/send-update                   │
│        └─ Alert admins (admin)                        │
│                                                         │
│  📅 CALENDAR.HTML (Calendar View)                      │
│  └─ Event Click                                       │
│     └─ Call: /api/email/send-update                   │
│        └─ Remind attendees                            │
│                                                         │
│  👤 PERSONALISATION.HTML (User Profile)               │
│  └─ Update Preferences                                │
│     └─ Call: /api/email/send-update                   │
│        └─ Confirm changes                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: User RSVPs for Event

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER ACTION: User clicks RSVP Button                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 2. JAVASCRIPT: ai.html RSVP handler executes          │
│    - Gets user email & event data                      │
│    - Stores RSVP in Firestore                          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 3. API CALL: JavaScript sends fetch request            │
│    POST /api/email/send-rsvp                           │
│    Body: {                                              │
│      recipientEmail: "user@example.com",               │
│      userType: "basic",                                │
│      rsvpData: { ... }                                 │
│    }                                                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 4. EXPRESS: server.js receives request                 │
│    - Validates data                                    │
│    - Calls emailService.sendRsvpConfirmation()         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 5. EMAILSERVICE: emailService.js processes             │
│    - Selects "basic" user template                     │
│    - Builds HTML email with event details              │
│    - Prepares Nodemailer transporter                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 6. NODEMAILER: Sends email via SMTP                    │
│    - Connects to Gmail SMTP                            │
│    - Authenticates with credentials from .env          │
│    - Sends email to user@example.com                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 7. RESPONSE: Returns success to browser                │
│    {                                                    │
│      "success": true,                                  │
│      "messageId": "<message@example.com>"              │
│    }                                                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ 8. USER: Gets confirmation email in inbox ✅          │
│    "RSVP Confirmed: Tech Summit"                       │
│    Shows event date, time, location                    │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Decision Tree: Which Email to Send?

```
What just happened?

├─ User Created Event?
│  └─→ Send INVITATION (to admin)
│
├─ Admin Approved Event?
│  ├─→ Send APPROVAL (to creator - basic)
│  └─→ Send UPDATE (to admins - admin)
│
├─ Admin Rejected Event?
│  └─→ Send APPROVAL (status: rejected, to creator)
│
├─ User RSVPs?
│  ├─→ Send RSVP (confirmation to user - basic)
│  └─→ Send RSVP (attendance metric to creator - admin)
│
├─ Event Details Changed?
│  ├─→ Send UPDATE (details to attendees - basic)
│  └─→ Send UPDATE (impact report to admins - admin)
│
└─ Sending to Multiple Users?
   └─→ Use BULK endpoint
```

---

## Feature Checklist

```
✅ Implemented Features:

CORE FUNCTIONALITY
 ✅ Send single emails
 ✅ Send bulk emails
 ✅ 4 email types (invitation, approval, update, rsvp)
 ✅ Role-based templates (admin & basic)
 ✅ HTML email with styling
 ✅ Error handling
 ✅ SMTP support (Gmail, Outlook, etc)

TEMPLATES
 ✅ Invitation - basic user
 ✅ Invitation - admin user
 ✅ Approval - basic user
 ✅ Approval - admin user
 ✅ Update - basic user
 ✅ Update - admin user
 ✅ RSVP - basic user
 ✅ RSVP - admin user

INTEGRATION
 ✅ Express endpoints (5 total)
 ✅ Frontend utility (emailClient.js)
 ✅ Code examples (8 scenarios)
 ✅ Firebase logging (optional)

DOCUMENTATION
 ✅ Setup guide
 ✅ API reference
 ✅ Code examples
 ✅ Quick reference
 ✅ Resource index
 ✅ This overview

SECURITY
 ✅ Environment variables
 ✅ .env configuration
 ✅ .gitignore setup
 ✅ Error handling
```

---

## Performance Notes

```
Email Sending Speed:
├─ Single email: ~1-2 seconds
├─ 10 emails (bulk): ~10-20 seconds
├─ 100 emails (bulk): ~100-200 seconds
└─ Recommended: Add 100-500ms delays between emails

Best Practices:
├─ Use bulk endpoint for mass sends
├─ Monitor SMTP rate limits
├─ Log failures for retry logic
├─ Test with small batches first
└─ Consider queuing system for large volumes
```

---

## You Are Ready! 🚀

Everything is set up and documented. Follow this flow:

1. **Read**: EMAIL_QUICK_REFERENCE.md (5 min)
2. **Setup**: EMAIL_SETUP_GUIDE.md (5 min)
3. **Test**: Run test script
4. **Integrate**: Add to your event handlers
5. **Deploy**: Push to production

**Happy emailing! 📧✨**


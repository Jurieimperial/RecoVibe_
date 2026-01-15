# RecoVibe Email System Documentation

## Overview
The RecoVibe email system provides automated email notifications for:
- **Event Invitations** - Notify users about new events
- **Approval Notifications** - Inform organizers and admins about event approval status
- **Event Updates** - Alert attendees of changes to events they've joined
- **RSVP Confirmations** - Confirm attendance and track metrics

All emails are **user-role-aware**, with different templates and content for admins vs. basic users.

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install nodemailer dotenv
```

### 2. Configure Email Credentials
Create a `.env` file in the root directory:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**For Gmail Users:**
1. Enable 2-factor authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer" (or your device)
4. Generate an app password and use it in `.env`

**For Other Email Services:**
Update `emailService.js` to use your SMTP settings:
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: { ... }
});
```

---

## API Endpoints

### 1. Send Event Invitation
**Endpoint:** `POST /api/email/send-invitation`

**Request Body:**
```json
{
  "recipientEmail": "user@example.com",
  "userType": "basic",
  "eventData": {
    "eventName": "Tech Symposium 2025",
    "eventDate": "March 15, 2025",
    "eventLocation": "Science Building, Room 301",
    "eventLink": "http://yourdomain.com/event/tech-symposium",
    "organizer": "Tech Club"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "<message@example.com>"
}
```

**Email Templates:**
- **Basic Users:** Friendly invitation with event details
- **Admin Users:** Formal review notice with organizer info and approval link

---

### 2. Send Approval Notification
**Endpoint:** `POST /api/email/send-approval`

**Request Body - For Basic Users:**
```json
{
  "recipientEmail": "organizer@example.com",
  "userType": "basic",
  "approvalData": {
    "eventName": "Tech Symposium 2025",
    "status": "Approved",
    "approverName": "Dr. Smith (Academic Head)",
    "notes": "Great event! Approved for March 15."
  }
}
```

**Request Body - For Admin Users:**
```json
{
  "recipientEmail": "admin@example.com",
  "userType": "admin",
  "approvalData": {
    "eventName": "Tech Symposium 2025",
    "status": "Approved",
    "previousStatus": "Pending",
    "actionTakenBy": "Dr. Smith"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "<message@example.com>"
}
```

---

### 3. Send Event Update
**Endpoint:** `POST /api/email/send-update`

**Request Body - For Basic Users:**
```json
{
  "recipientEmail": "attendee@example.com",
  "userType": "basic",
  "updateData": {
    "eventName": "Tech Symposium 2025",
    "updateType": "Location Changed",
    "updateDetails": "The event has been moved from Science Building to the New Convention Center due to higher attendance.",
    "eventLink": "http://yourdomain.com/event/tech-symposium"
  }
}
```

**Request Body - For Admin Users:**
```json
{
  "recipientEmail": "admin@example.com",
  "userType": "admin",
  "updateData": {
    "eventName": "Tech Symposium 2025",
    "updateType": "Location Changed",
    "changes": [
      "Location: Science Building → New Convention Center",
      "Capacity: 150 → 500"
    ],
    "affectedAttendees": 45
  }
}
```

---

### 4. Send RSVP Confirmation
**Endpoint:** `POST /api/email/send-rsvp`

**Request Body - For Basic Users:**
```json
{
  "recipientEmail": "attendee@example.com",
  "userType": "basic",
  "rsvpData": {
    "eventName": "Tech Symposium 2025",
    "eventDate": "March 15, 2025",
    "eventTime": "2:00 PM - 5:00 PM",
    "eventLocation": "New Convention Center"
  }
}
```

**Request Body - For Admin Users:**
```json
{
  "recipientEmail": "admin@example.com",
  "userType": "admin",
  "rsvpData": {
    "eventName": "Tech Symposium 2025",
    "attendeeName": "John Doe",
    "rsvpCount": 125
  }
}
```

---

### 5. Send Bulk Emails
**Endpoint:** `POST /api/email/send-bulk`

**Request Body:**
```json
{
  "recipients": [
    { "email": "user1@example.com", "userType": "basic" },
    { "email": "user2@example.com", "userType": "admin" },
    { "email": "user3@example.com", "userType": "basic" }
  ],
  "emailType": "invitation",
  "emailData": {
    "eventName": "Tech Symposium 2025",
    "eventDate": "March 15, 2025",
    "eventLocation": "New Convention Center",
    "eventLink": "http://yourdomain.com/event/tech-symposium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    { "email": "user1@example.com", "success": true, "messageId": "..." },
    { "email": "user2@example.com", "success": true, "messageId": "..." },
    { "email": "user3@example.com", "success": false, "error": "Invalid email" }
  ]
}
```

---

## Frontend Integration

### Using the Email Client

**Import the module:**
```javascript
import emailClient from './emailClient.js';
```

**Send an invitation:**
```javascript
try {
  const result = await emailClient.sendInvitation(
    'user@example.com',
    'basic',
    {
      eventName: 'Tech Symposium',
      eventDate: 'March 15, 2025',
      eventLocation: 'Convention Center',
      eventLink: 'http://yourdomain.com/event/tech'
    }
  );
  console.log('Email sent:', result.messageId);
} catch (error) {
  console.error('Failed to send email:', error);
}
```

**Send approval notification:**
```javascript
await emailClient.sendApproval(
  'organizer@example.com',
  'basic',
  {
    eventName: 'Tech Symposium',
    status: 'Approved',
    approverName: 'Dr. Smith',
    notes: 'Excellent event!'
  }
);
```

**Send bulk emails:**
```javascript
const recipients = [
  { email: 'user1@example.com', userType: 'basic' },
  { email: 'user2@example.com', userType: 'basic' }
];

const result = await emailClient.sendBulk(
  recipients,
  'update',
  {
    eventName: 'Tech Symposium',
    updateType: 'Date Changed',
    updateDetails: 'The event is now on March 20 instead of March 15.',
    eventLink: 'http://yourdomain.com/event/tech'
  }
);
```

---

## Email Templates Overview

### Invitation Templates

**Basic User Template:**
- Friendly, welcoming tone
- Clear event details (name, date, location)
- Direct "View Event Details" link
- Call to action: "Don't miss out!"

**Admin Template:**
- Professional tone
- Includes organizer information
- "Review & Approve" button instead of regular RSVP
- Expects action from admin

---

### Approval Templates

**Basic User Template:**
- Clear approval status (Approved ✅ or Rejected)
- Approver name
- Optional notes section
- Success/action message

**Admin Template:**
- Alert format with status changes
- Previous and current status
- Admin who took the action
- Automatic notification

---

### Update Templates

**Basic User Template:**
- Highlights update type
- Clear details of what changed
- "View Updated Event" button
- Easy to scan format

**Admin Template:**
- Detailed change log
- Number of affected attendees
- Before/after comparison
- Administrative alert tone

---

### RSVP Templates

**Basic User Template:**
- Confirmation message with checkmark
- Event details recap
- Add to calendar reminder
- Celebratory tone

**Admin Template:**
- Tracking notification
- Attendee name and email
- Running count of RSVPs
- Minimal content (admin summary)

---

## Integration with ai.html

### Modify RSVP Handler
In `ai.html`, update the RSVP button click handler:

```javascript
card.querySelector('.rsvp-btn').addEventListener('click', async () => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      alert('Please log in to RSVP.');
      return;
    }

    const eventRef = doc.ref;
    const rsvpRef = eventRef.collection('rsvps').doc(user.uid);
    const rsvpSnap = await rsvpRef.get();

    if (rsvpSnap.exists) {
      alert('You have already RSVP\'d for this event.');
      return;
    }

    // Store RSVP in Firestore
    await rsvpRef.set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      email: user.email
    });

    await eventRef.update({
      attending: firebase.firestore.FieldValue.increment(1)
    });

    // **NEW: Send RSVP confirmation email**
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

    alert('RSVP successful! You have joined this event.');
    loadEvents();
  } catch (err) {
    alert('RSVP error: ' + err.message);
  }
});
```

---

## Error Handling

All email endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Common errors:**
- `Missing required fields` - Check all parameters are provided
- `Invalid email address` - Verify recipient email format
- `Failed to send` - Check email credentials in `.env`
- `SMTP connection failed` - Verify email service configuration

---

## Best Practices

1. **Always verify email addresses** before sending
2. **Test with your own email first** before sending to users
3. **Use meaningful email content** - include all relevant event details
4. **Track email sends** - Log successful/failed sends in your database
5. **Handle errors gracefully** - Don't crash if email fails to send
6. **Rate limiting** - Implement delays for bulk sends to avoid SMTP limits
7. **Unsubscribe options** - Consider adding unsubscribe links for compliance

---

## Troubleshooting

### "Error: connect ECONNREFUSED"
- Email credentials are incorrect in `.env`
- For Gmail, ensure you're using an App Password, not your regular password
- Verify 2-factor authentication is enabled

### "Error: Invalid login"
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Regenerate app password if using Gmail

### Emails not being sent
- Verify `nodemailer` is installed: `npm list nodemailer`
- Check server console for error messages
- Ensure `.env` file exists and is configured

### Bulk emails failing partially
- Check the `results` array in response for which emails failed
- Implement retry logic for failed sends

---

## Security Considerations

⚠️ **Important:**
- Never commit `.env` file to version control
- Use environment variables in production
- Validate all email addresses on the backend
- Implement rate limiting for email endpoints
- Consider GDPR/CCPA compliance for email lists

---

## Future Enhancements

- [ ] Email templates customization
- [ ] Scheduled/delayed emails
- [ ] Email scheduling/reminders
- [ ] Unsubscribe functionality
- [ ] Email analytics (open rates, clicks)
- [ ] Support for attachments (certificates, etc.)
- [ ] Multi-language templates
- [ ] Email preview in browser


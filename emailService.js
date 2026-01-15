/**
 * Email Service Module
 * Handles sending emails for updates, invitations, and approvals
 * Differentiates between admin and basic user email templates
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

/**
 * Email templates for different user types and scenarios
 */
const emailTemplates = {
  // ===== INVITATIONS =====
  eventInvitation: {
    basic: (eventName, eventDate, eventLocation, eventLink) => ({
      subject: `You're Invited: ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Event Invitation 🎉</h2>
          <p>You've been invited to join:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${eventName}</h3>
            <p><strong>📅 Date:</strong> ${eventDate}</p>
            <p><strong>📍 Location:</strong> ${eventLocation}</p>
          </div>
          <p>
            <a href="${eventLink}" style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Event Details
            </a>
          </p>
          <p style="color: #888; font-size: 12px;">Don't miss out on this amazing opportunity!</p>
        </div>
      `
    }),
    admin: (eventName, eventDate, eventLocation, eventLink, organizer) => ({
      subject: `Event Invitation: ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Event Invitation (Admin) 📋</h2>
          <p>A new event has been submitted for your review:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${eventName}</h3>
            <p><strong>📅 Scheduled Date:</strong> ${eventDate}</p>
            <p><strong>📍 Location:</strong> ${eventLocation}</p>
            <p><strong>👤 Organizer:</strong> ${organizer}</p>
          </div>
          <p>
            <a href="${eventLink}" style="background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Review & Approve
            </a>
          </p>
          <p style="color: #888; font-size: 12px;">Please review and approve/reject this event.</p>
        </div>
      `
    })
  },

  // ===== APPROVALS =====
  eventApprovalNotice: {
    basic: (eventName, status, approverName, notes) => ({
      subject: `Event ${status}: ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Event ${status} Notification</h2>
          <p>Your event has been <strong style="color: ${status === 'Approved' ? '#27ae60' : '#e74c3c'};">${status.toUpperCase()}</strong>:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${eventName}</h3>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Reviewed by:</strong> ${approverName}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          ${status === 'Approved' ? 
            `<p>✅ Your event is now live and visible to attendees!</p>` :
            `<p>⚠️ Please review the feedback and make necessary changes before resubmitting.</p>`
          }
        </div>
      `
    }),
    admin: (eventName, status, previousStatus, actionTakenBy) => ({
      subject: `Admin Alert: ${eventName} - ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Event Status Update (Admin)</h2>
          <p>An event's approval status has changed:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${eventName}</h3>
            <p><strong>Previous Status:</strong> ${previousStatus}</p>
            <p><strong>New Status:</strong> ${status}</p>
            <p><strong>Action Taken by:</strong> ${actionTakenBy}</p>
          </div>
          <p style="color: #888; font-size: 12px;">This is an automated notification.</p>
        </div>
      `
    })
  },

  // ===== UPDATES =====
  eventUpdate: {
    basic: (eventName, updateType, updateDetails, eventLink) => ({
      subject: `Update: ${eventName} - ${updateType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Event Update 📢</h2>
          <p>There's an important update for an event you're attending:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${eventName}</h3>
            <p><strong>Update Type:</strong> ${updateType}</p>
            <p><strong>Details:</strong></p>
            <p>${updateDetails}</p>
          </div>
          <p>
            <a href="${eventLink}" style="background: #f39c12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Updated Event
            </a>
          </p>
        </div>
      `
    }),
    admin: (eventName, updateType, changes, affectedAttendees) => ({
      subject: `Admin: Event Update - ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Event Update Alert (Admin)</h2>
          <p>An event you're monitoring has been updated:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${eventName}</h3>
            <p><strong>Update Type:</strong> ${updateType}</p>
            <p><strong>Changes Made:</strong></p>
            <ul>${changes.map(c => `<li>${c}</li>`).join('')}</ul>
            <p><strong>Attendees Affected:</strong> ${affectedAttendees}</p>
          </div>
          <p style="color: #888; font-size: 12px;">Review the update details above.</p>
        </div>
      `
    })
  },

  // ===== RSVP CONFIRMATION =====
  rsvpConfirmation: {
    basic: (eventName, eventDate, eventTime, eventLocation) => ({
      subject: `RSVP Confirmed: ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">✅ RSVP Confirmed</h2>
          <p>You're all set! Your RSVP has been confirmed:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${eventName}</h3>
            <p><strong>📅 Date:</strong> ${eventDate}</p>
            <p><strong>⏰ Time:</strong> ${eventTime}</p>
            <p><strong>📍 Location:</strong> ${eventLocation}</p>
          </div>
          <p>We can't wait to see you there! Add to your calendar if you haven't already.</p>
        </div>
      `
    }),
    admin: (eventName, attendeeName, attendeeEmail, rsvpCount) => ({
      subject: `RSVP Tracked: ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">RSVP Confirmation (Admin)</h2>
          <p>A new RSVP has been recorded:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c3e50;">${eventName}</h3>
            <p><strong>Attendee:</strong> ${attendeeName}</p>
            <p><strong>Email:</strong> ${attendeeEmail}</p>
            <p><strong>Total RSVPs:</strong> ${rsvpCount}</p>
          </div>
        </div>
      `
    })
  }
};

/**
 * Send email for event invitation
 * @param {string} recipientEmail - Recipient email address
 * @param {string} userType - 'admin' or 'basic'
 * @param {object} eventData - Event information
 */
async function sendEventInvitation(recipientEmail, userType, eventData) {
  try {
    const { eventName, eventDate, eventLocation, eventLink, organizer } = eventData;
    
    const template = emailTemplates.eventInvitation[userType];
    const emailContent = userType === 'admin'
      ? template(eventName, eventDate, eventLocation, eventLink, organizer)
      : template(eventName, eventDate, eventLocation, eventLink);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Invitation email sent to ${recipientEmail}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending invitation to ${recipientEmail}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send approval notification
 * @param {string} recipientEmail - Recipient email address
 * @param {string} userType - 'admin' or 'basic'
 * @param {object} approvalData - Approval information
 */
async function sendApprovalNotification(recipientEmail, userType, approvalData) {
  try {
    const { eventName, status, approverName, notes, previousStatus, actionTakenBy } = approvalData;
    
    const template = emailTemplates.eventApprovalNotice[userType];
    const emailContent = userType === 'admin'
      ? template(eventName, status, previousStatus, actionTakenBy)
      : template(eventName, status, approverName, notes);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Approval notification sent to ${recipientEmail}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending approval notification to ${recipientEmail}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send event update notification
 * @param {string} recipientEmail - Recipient email address
 * @param {string} userType - 'admin' or 'basic'
 * @param {object} updateData - Update information
 */
async function sendEventUpdate(recipientEmail, userType, updateData) {
  try {
    const { eventName, updateType, updateDetails, eventLink, changes, affectedAttendees } = updateData;
    
    const template = emailTemplates.eventUpdate[userType];
    const emailContent = userType === 'admin'
      ? template(eventName, updateType, changes, affectedAttendees)
      : template(eventName, updateType, updateDetails, eventLink);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Update notification sent to ${recipientEmail}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending update notification to ${recipientEmail}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send RSVP confirmation
 * @param {string} recipientEmail - Recipient email address
 * @param {string} userType - 'admin' or 'basic'
 * @param {object} rsvpData - RSVP information
 */
async function sendRsvpConfirmation(recipientEmail, userType, rsvpData) {
  try {
    const { eventName, eventDate, eventTime, eventLocation, attendeeName, rsvpCount } = rsvpData;
    
    const template = emailTemplates.rsvpConfirmation[userType];
    const emailContent = userType === 'admin'
      ? template(eventName, attendeeName, recipientEmail, rsvpCount)
      : template(eventName, eventDate, eventTime, eventLocation);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ RSVP confirmation sent to ${recipientEmail}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending RSVP confirmation to ${recipientEmail}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send bulk email to multiple recipients
 * @param {array} recipients - Array of {email, userType}
 * @param {string} emailType - Type of email ('invitation', 'approval', 'update', 'rsvp')
 * @param {object} emailData - Email content data
 */
async function sendBulkEmail(recipients, emailType, emailData) {
  try {
    const results = [];
    
    for (const recipient of recipients) {
      let result;
      switch (emailType) {
        case 'invitation':
          result = await sendEventInvitation(recipient.email, recipient.userType, emailData);
          break;
        case 'approval':
          result = await sendApprovalNotification(recipient.email, recipient.userType, emailData);
          break;
        case 'update':
          result = await sendEventUpdate(recipient.email, recipient.userType, emailData);
          break;
        case 'rsvp':
          result = await sendRsvpConfirmation(recipient.email, recipient.userType, emailData);
          break;
        default:
          result = { success: false, error: 'Unknown email type' };
      }
      results.push({ email: recipient.email, ...result });
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('❌ Error sending bulk emails:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEventInvitation,
  sendApprovalNotification,
  sendEventUpdate,
  sendRsvpConfirmation,
  sendBulkEmail,
  emailTemplates
};

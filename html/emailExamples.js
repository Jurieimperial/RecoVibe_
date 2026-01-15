/**
 * Email System Examples
 * Shows practical usage of the email system in different scenarios
 */

// Example 1: Send invitation when event is created
// This would be in your event creation handler
async function onEventCreated(eventData, creatorEmail) {
  try {
    // Send to event creator (basic user)
    await fetch('/api/email/send-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: creatorEmail,
        userType: 'basic',
        eventData: {
          eventName: eventData.name,
          eventDate: eventData.date,
          eventLocation: eventData.location,
          eventLink: `${window.location.origin}/event/${eventData.id}`,
          organizer: eventData.organizerName
        }
      })
    });

    // Send to admin for review
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
          eventLink: `${window.location.origin}/admin/review/${eventData.id}`,
          organizer: eventData.organizerName
        }
      })
    });

    console.log('Event invitations sent successfully');
  } catch (error) {
    console.error('Error sending invitations:', error);
  }
}

// ================================================================

// Example 2: Send approval notification after event is approved
async function onEventApproved(eventData, approverName, approverEmail, notes = '') {
  try {
    // Send to event creator (basic user)
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
          notes: notes || 'Your event has been approved and is now live!'
        }
      })
    });

    // Send to other admins (admin users)
    const adminEmails = ['admin1@university.edu', 'admin2@university.edu'];
    
    for (const adminEmail of adminEmails) {
      await fetch('/api/email/send-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: adminEmail,
          userType: 'admin',
          approvalData: {
            eventName: eventData.name,
            status: 'Approved',
            previousStatus: 'Pending',
            actionTakenBy: approverName
          }
        })
      });
    }

    console.log('Approval notifications sent');
  } catch (error) {
    console.error('Error sending approval notifications:', error);
  }
}

// ================================================================

// Example 3: Send rejection notification
async function onEventRejected(eventData, approverName, notes) {
  try {
    // Send to event creator
    await fetch('/api/email/send-approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: eventData.creatorEmail,
        userType: 'basic',
        approvalData: {
          eventName: eventData.name,
          status: 'Rejected',
          approverName: approverName,
          notes: notes || 'Please review the feedback and try again.'
        }
      })
    });

    console.log('Rejection notification sent to creator');
  } catch (error) {
    console.error('Error sending rejection notification:', error);
  }
}

// ================================================================

// Example 4: Send event update to all attendees
async function notifyAttendeeOfUpdate(eventData, attendeesList, updateType, updateDetails) {
  try {
    // Send bulk email to all attendees
    const recipients = attendeesList.map(attendee => ({
      email: attendee.email,
      userType: 'basic'
    }));

    const response = await fetch('/api/email/send-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: recipients,
        emailType: 'update',
        emailData: {
          eventName: eventData.name,
          updateType: updateType, // e.g., "Time Changed", "Location Changed"
          updateDetails: updateDetails,
          eventLink: `${window.location.origin}/event/${eventData.id}`
        }
      })
    });

    const result = await response.json();
    console.log(`Update sent to ${result.results.filter(r => r.success).length} attendees`);
    
    // Log failures
    const failures = result.results.filter(r => !r.success);
    if (failures.length > 0) {
      console.warn('Failed to send to:', failures);
    }
  } catch (error) {
    console.error('Error sending bulk update:', error);
  }
}

// ================================================================

// Example 5: Send RSVP confirmation
async function onRsvpConfirmed(user, eventData) {
  try {
    // Send to attendee
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

    // Send RSVP count update to event creator/admin
    const attendeeCount = await getAttendeeCount(eventData.id);
    
    await fetch('/api/email/send-rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: eventData.creatorEmail,
        userType: 'admin',
        rsvpData: {
          eventName: eventData.name,
          attendeeName: user.name,
          rsvpCount: attendeeCount
        }
      })
    });

    console.log('RSVP confirmation emails sent');
  } catch (error) {
    console.error('Error sending RSVP confirmation:', error);
  }
}

// ================================================================

// Example 6: Send reminder emails before event
async function sendEventReminders(eventData, attendeesList, hoursBeforeEvent = 24) {
  try {
    const eventTime = new Date(eventData.date + ' ' + eventData.time);
    const now = new Date();
    const timeUntilEvent = (eventTime - now) / (1000 * 60 * 60);

    if (timeUntilEvent <= hoursBeforeEvent && timeUntilEvent > hoursBeforeEvent - 1) {
      const recipients = attendeesList.map(attendee => ({
        email: attendee.email,
        userType: 'basic'
      }));

      await fetch('/api/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipients,
          emailType: 'update',
          emailData: {
            eventName: eventData.name,
            updateType: 'Event Reminder',
            updateDetails: `Your event "${eventData.name}" is starting in ${Math.round(timeUntilEvent)} hours! 
            Don't forget to mark it on your calendar.`,
            eventLink: `${window.location.origin}/event/${eventData.id}`
          }
        })
      });

      console.log('Reminder emails sent');
    }
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
}

// ================================================================

// Example 7: Send feedback request after event
async function sendPostEventFeedback(eventData, attendeesList) {
  try {
    const recipients = attendeesList.map(attendee => ({
      email: attendee.email,
      userType: 'basic'
    }));

    await fetch('/api/email/send-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: recipients,
        emailType: 'update',
        emailData: {
          eventName: eventData.name,
          updateType: 'Event Feedback Request',
          updateDetails: `Thank you for attending ${eventData.name}! 
          We'd love to hear your feedback to help us improve future events.`,
          eventLink: `${window.location.origin}/feedback/${eventData.id}`
        }
      })
    });

    console.log('Feedback request emails sent');
  } catch (error) {
    console.error('Error sending feedback requests:', error);
  }
}

// ================================================================

// Example 8: Send certificate or confirmation to approved attendees
async function sendEventCertificate(eventData, approvedAttendees) {
  try {
    const recipients = approvedAttendees.map(attendee => ({
      email: attendee.email,
      userType: 'basic'
    }));

    await fetch('/api/email/send-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: recipients,
        emailType: 'update',
        emailData: {
          eventName: eventData.name,
          updateType: 'Certificate of Attendance',
          updateDetails: `Congratulations! Your attendance at "${eventData.name}" has been verified. 
          Your certificate is now available for download.`,
          eventLink: `${window.location.origin}/certificate/${eventData.id}`
        }
      })
    });

    console.log('Certificate emails sent');
  } catch (error) {
    console.error('Error sending certificates:', error);
  }
}

// ================================================================

// Helper function: Get attendee count
async function getAttendeeCount(eventId) {
  // This should query your database/Firestore
  // Placeholder implementation
  return 42;
}

// ================================================================

// Export examples (if using modules)
export {
  onEventCreated,
  onEventApproved,
  onEventRejected,
  notifyAttendeeOfUpdate,
  onRsvpConfirmed,
  sendEventReminders,
  sendPostEventFeedback,
  sendEventCertificate
};

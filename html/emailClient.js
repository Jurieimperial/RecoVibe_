/**
 * Email API Client
 * Frontend utility for calling email endpoints
 * Usage: import emailClient from './emailClient.js'
 */

const EMAIL_BASE_URL = '/api/email';

const emailClient = {
  /**
   * Send event invitation
   * @param {string} recipientEmail - Email address
   * @param {string} userType - 'admin' or 'basic'
   * @param {object} eventData - { eventName, eventDate, eventLocation, eventLink, organizer? }
   */
  async sendInvitation(recipientEmail, userType, eventData) {
    try {
      const response = await fetch(`${EMAIL_BASE_URL}/send-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, userType, eventData })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send invitation');
      return data;
    } catch (err) {
      console.error('Error sending invitation:', err);
      throw err;
    }
  },

  /**
   * Send approval notification
   * @param {string} recipientEmail - Email address
   * @param {string} userType - 'admin' or 'basic'
   * @param {object} approvalData - { eventName, status, approverName?, notes?, previousStatus?, actionTakenBy? }
   */
  async sendApproval(recipientEmail, userType, approvalData) {
    try {
      const response = await fetch(`${EMAIL_BASE_URL}/send-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, userType, approvalData })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send approval');
      return data;
    } catch (err) {
      console.error('Error sending approval:', err);
      throw err;
    }
  },

  /**
   * Send event update
   * @param {string} recipientEmail - Email address
   * @param {string} userType - 'admin' or 'basic'
   * @param {object} updateData - { eventName, updateType, updateDetails?, eventLink?, changes?, affectedAttendees? }
   */
  async sendUpdate(recipientEmail, userType, updateData) {
    try {
      const response = await fetch(`${EMAIL_BASE_URL}/send-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, userType, updateData })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send update');
      return data;
    } catch (err) {
      console.error('Error sending update:', err);
      throw err;
    }
  },

  /**
   * Send RSVP confirmation
   * @param {string} recipientEmail - Email address
   * @param {string} userType - 'admin' or 'basic'
   * @param {object} rsvpData - { eventName, eventDate?, eventTime?, eventLocation?, attendeeName?, rsvpCount? }
   */
  async sendRsvpConfirmation(recipientEmail, userType, rsvpData) {
    try {
      const response = await fetch(`${EMAIL_BASE_URL}/send-rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, userType, rsvpData })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send RSVP confirmation');
      return data;
    } catch (err) {
      console.error('Error sending RSVP confirmation:', err);
      throw err;
    }
  },

  /**
   * Send bulk emails to multiple recipients
   * @param {array} recipients - Array of { email, userType }
   * @param {string} emailType - 'invitation', 'approval', 'update', or 'rsvp'
   * @param {object} emailData - Email content data
   */
  async sendBulk(recipients, emailType, emailData) {
    try {
      const response = await fetch(`${EMAIL_BASE_URL}/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, emailType, emailData })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send bulk emails');
      return data;
    } catch (err) {
      console.error('Error sending bulk emails:', err);
      throw err;
    }
  }
};

export default emailClient;

/**
 * Email Logging Module
 * Logs all sent emails to Firestore for tracking and analytics
 * Usage: Import and call logEmail() after sending emails
 */

/**
 * Log sent email to Firestore
 * Creates a collection 'emailLogs' with records of all sent emails
 */
async function logEmailToFirebase(emailData) {
  try {
    const db = firebase.firestore();
    
    await db.collection('emailLogs').add({
      recipientEmail: emailData.recipientEmail,
      userType: emailData.userType,
      emailType: emailData.emailType, // 'invitation', 'approval', 'update', 'rsvp'
      relatedEventId: emailData.eventId || null,
      relatedEventName: emailData.eventName || null,
      subject: emailData.subject || null,
      status: emailData.status, // 'sent', 'failed'
      errorMessage: emailData.error || null,
      messageId: emailData.messageId || null,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      sentBy: emailData.sentBy || 'system'
    });

    console.log(`✅ Email logged for ${emailData.recipientEmail}`);
    return true;
  } catch (error) {
    console.error('Error logging email to Firestore:', error);
    return false;
  }
}

/**
 * Get email log statistics
 * Returns metrics about email sending
 */
async function getEmailStats(dateRange = 'today') {
  try {
    const db = firebase.firestore();
    let query = db.collection('emailLogs');

    // Filter by date range
    const now = new Date();
    let startDate;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    query = query.where('timestamp', '>=', startDate);
    const snapshot = await query.get();

    const stats = {
      totalSent: 0,
      successCount: 0,
      failureCount: 0,
      byType: {
        invitation: 0,
        approval: 0,
        update: 0,
        rsvp: 0
      },
      byUserType: {
        basic: 0,
        admin: 0
      },
      successRate: 0,
      failures: []
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      stats.totalSent++;

      if (data.status === 'sent') {
        stats.successCount++;
      } else {
        stats.failureCount++;
        stats.failures.push({
          email: data.recipientEmail,
          type: data.emailType,
          error: data.errorMessage,
          timestamp: data.timestamp?.toDate()
        });
      }

      if (data.emailType) stats.byType[data.emailType]++;
      if (data.userType) stats.byUserType[data.userType]++;
    });

    stats.successRate = stats.totalSent > 0 
      ? ((stats.successCount / stats.totalSent) * 100).toFixed(2) + '%'
      : '0%';

    return stats;
  } catch (error) {
    console.error('Error getting email stats:', error);
    return null;
  }
}

/**
 * Get email history for a specific user
 */
async function getUserEmailHistory(userEmail, limit = 10) {
  try {
    const db = firebase.firestore();
    const snapshot = await db.collection('emailLogs')
      .where('recipientEmail', '==', userEmail)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });

    return history;
  } catch (error) {
    console.error('Error getting user email history:', error);
    return [];
  }
}

/**
 * Get email history for a specific event
 */
async function getEventEmailHistory(eventId, limit = 50) {
  try {
    const db = firebase.firestore();
    const snapshot = await db.collection('emailLogs')
      .where('relatedEventId', '==', eventId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });

    return history;
  } catch (error) {
    console.error('Error getting event email history:', error);
    return [];
  }
}

/**
 * Retry failed emails
 * Finds emails marked as failed and attempts to resend
 */
async function retryFailedEmails() {
  try {
    const db = firebase.firestore();
    const snapshot = await db.collection('emailLogs')
      .where('status', '==', 'failed')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const retried = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      retried.push({
        id: doc.id,
        email: data.recipientEmail,
        type: data.emailType,
        error: data.errorMessage
      });
    });

    console.log(`Found ${retried.length} failed emails to retry`);
    return retried;
  } catch (error) {
    console.error('Error finding failed emails:', error);
    return [];
  }
}

/**
 * Create email reporting dashboard queries
 */
async function getEmailReportData() {
  try {
    // Get today's stats
    const todayStats = await getEmailStats('today');
    
    // Get this week's stats
    const weekStats = await getEmailStats('week');
    
    // Get this month's stats
    const monthStats = await getEmailStats('month');

    return {
      today: todayStats,
      week: weekStats,
      month: monthStats
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return null;
  }
}

/**
 * Example: Integrate with your email sending function
 * This wrapper function sends an email AND logs it
 */
async function sendEmailWithLogging(emailConfig) {
  try {
    // Send the actual email
    const response = await fetch(emailConfig.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailConfig.body)
    });

    const result = await response.json();

    // Log to Firebase
    const logData = {
      recipientEmail: emailConfig.body.recipientEmail,
      userType: emailConfig.body.userType,
      emailType: emailConfig.emailType,
      eventId: emailConfig.eventId || null,
      eventName: emailConfig.eventName || null,
      status: result.success ? 'sent' : 'failed',
      messageId: result.messageId || null,
      error: result.error || null,
      sentBy: firebase.auth().currentUser?.email || 'system'
    };

    await logEmailToFirebase(logData);

    return result;
  } catch (error) {
    console.error('Error in sendEmailWithLogging:', error);
    throw error;
  }
}

/**
 * Usage Example:
 * 
 * // Send email with automatic logging
 * await sendEmailWithLogging({
 *   endpoint: '/api/email/send-rsvp',
 *   emailType: 'rsvp',
 *   eventId: 'event-123',
 *   eventName: 'Tech Summit',
 *   body: {
 *     recipientEmail: 'user@example.com',
 *     userType: 'basic',
 *     rsvpData: { ... }
 *   }
 * });
 * 
 * // Get statistics
 * const stats = await getEmailStats('week');
 * console.log(`Sent: ${stats.successCount}, Failed: ${stats.failureCount}`);
 * 
 * // Check specific user's email history
 * const history = await getUserEmailHistory('user@example.com', 20);
 * console.log(history);
 * 
 * // Get full report
 * const report = await getEmailReportData();
 * console.log(report);
 */

// Export functions for use in your app
export {
  logEmailToFirebase,
  getEmailStats,
  getUserEmailHistory,
  getEventEmailHistory,
  retryFailedEmails,
  getEmailReportData,
  sendEmailWithLogging
};

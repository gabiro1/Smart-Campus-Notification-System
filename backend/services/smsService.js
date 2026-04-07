/**
 * SMS Service - Pure business logic for sending SMS via Twilio
 * This module can be used by both the SMS controller and notification dispatcher
 */

import twilio from 'twilio';

let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured. Set TWILIO_SID and TWILIO_AUTH_TOKEN in .env');
    }

    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
};

/**
 * Send an SMS message
 * @param {string} to - Recipient phone number (E.164 format recommended)
 * @param {string} body - Message content
 * @returns {Promise<Object>} Twilio message result with sid, etc.
 */
export const sendSMSViaTwilio = async (to, body) => {
  const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioFromNumber) {
    throw new Error('TWILIO_PHONE_NUMBER not set in environment variables');
  }

  // Basic phone number validation/cleaning
  const cleanedPhone = to.replace(/[\s-\(\)]/g, '');
  if (!/^\+?[1-9]\d{10,15}$/.test(cleanedPhone)) {
    throw new Error('Invalid phone number format. Use E.164 format (e.g., +1234567890)');
  }

  const client = getTwilioClient();
  const messageResult = await client.messages.create({
    body,
    from: twilioFromNumber,
    to: cleanedPhone
  });

  return {
    sid: messageResult.sid,
    to: cleanedPhone,
    status: messageResult.status,
    dateCreated: messageResult.dateCreated
  };
};

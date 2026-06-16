/**
 * SMS Service - Pure business logic for sending SMS via Twilio
 * This module can be used by both the SMS controller and notification dispatcher
 */

import twilio from 'twilio';
import SystemSettings from '../modules/settings/model/SystemSettings.js';

let twilioClient = null;

const isMockMode = () => process.env.SMS_MOCK_MODE === 'true';

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
 * Track SMS usage in SystemSettings
 */
const trackSMSUsage = async () => {
  try {
    const smsSettings = await SystemSettings.findOneAndUpdate(
      { key: 'sms' },
      { $inc: { 'data.smsQuota.used': 1 } },
      { new: true, upsert: true }
    );
    
    const { used, limit } = smsSettings.data.smsQuota;
    const percentage = (used / limit) * 100;
    
    if (percentage >= 90) {
      console.warn(`⚠️ [SMS Quota] WARNING: ${percentage.toFixed(1)}% used (${used}/${limit})`);
    }
    if (percentage >= 100) {
      console.error(`🚫 [SMS Quota] CRITICAL: Limit reached (${used}/${limit})`);
    }
  } catch (err) {
    console.error('[SMS Quota] Failed to track usage:', err.message);
  }
};

/**
 * Get SMS quota status
 */
export const getSMSQuotaStatus = async () => {
  try {
    const settings = await SystemSettings.findOne({ key: 'sms' });
    if (!settings) {
      return { used: 0, limit: 10000, percentage: 0 };
    }
    const { used, limit } = settings.data.smsQuota;
    return {
      used,
      limit,
      percentage: limit > 0 ? (used / limit) * 100 : 0
    };
  } catch (err) {
    console.error('[SMS Quota] Failed to get status:', err.message);
    return { used: 0, limit: 10000, percentage: 0 };
  }
};

/**
 * Send an SMS message
 * @param {string} to - Recipient phone number (E.164 format recommended)
 * @param {string} body - Message content
 * @returns {Promise<Object>} Twilio message result with sid, etc.
 */
export const sendSMSViaTwilio = async (to, body) => {
  // MOCK MODE: Simulate SMS sending without Twilio
  if (isMockMode()) {
    console.log('📱 [SMS MOCK] Sending mock SMS:');
    console.log(`   To: ${to}`);
    console.log(`   Message: ${body.substring(0, 50)}...`);
    
    // Track usage in mock mode too
    await trackSMSUsage();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock result
    return {
      sid: `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to: to.replace(/[\s-\(\)]/g, ''),
      status: 'mock_success',
      dateCreated: new Date().toISOString(),
      quotaRemaining: 9999,
      mockMode: true
    };
  }

  // REAL MODE: Use Twilio
  const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioFromNumber) {
    throw new Error('TWILIO_PHONE_NUMBER not set in environment variables');
  }

  // Basic phone number validation/cleaning
  const cleanedPhone = to.replace(/[\s-\(\)]/g, '');
  if (!/^\+?[1-9]\d{10,15}$/.test(cleanedPhone)) {
    throw new Error('Invalid phone number format. Use E.164 format (e.g., +1234567890)');
  }

  // Check quota before sending
  const quota = await getSMSQuotaStatus();
  if (quota.percentage >= 100) {
    throw new Error('SMS quota limit reached. Please contact administrator.');
  }

  const client = getTwilioClient();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 [SMS] Sending via Twilio...');
  console.log(`   From : ${twilioFromNumber}`);
  console.log(`   To   : ${cleanedPhone}`);
  console.log(`   Body : ${body.substring(0, 80)}${body.length > 80 ? '...' : ''}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let messageResult;
  try {
    messageResult = await client.messages.create({
      body,
      from: twilioFromNumber,
      to: cleanedPhone
    });
  } catch (twilioErr) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ [SMS] Twilio error:');
    console.error(`   Code    : ${twilioErr.code}`);
    console.error(`   Message : ${twilioErr.message}`);
    console.error(`   Status  : ${twilioErr.status}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    throw twilioErr;
  }

  console.log('✅ [SMS] Delivered!');
  console.log(`   SID    : ${messageResult.sid}`);
  console.log(`   Status : ${messageResult.status}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Track usage asynchronously (don't block on quota update)
  trackSMSUsage().catch(err => console.error('[SMS] Quota tracking error:', err.message));

  return {
    sid: messageResult.sid,
    to: cleanedPhone,
    status: messageResult.status,
    dateCreated: messageResult.dateCreated,
    quotaRemaining: quota.limit - quota.used - 1
  };
};

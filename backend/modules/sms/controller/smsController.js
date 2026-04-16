import { sendSMSViaTwilio } from '../../../services/smsService.js';
import SystemSettings from '../../../modules/settings/model/SystemSettings.js';

/**
 * @desc    Send SMS to a recipient
 * @route   POST /api/messages/sms
 * @access  Private (HOD/Admin)
 */
export const sendSMS = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ success: false, message: "Phone number and message are required." });
    }

    const result = await sendSMSViaTwilio(phoneNumber, message);

    console.log(`[SMS] Sent to ${result.to} (SID: ${result.sid})`);

    res.status(200).json({
      success: true,
      message: "SMS sent successfully.",
      sid: result.sid,
      to: result.to
    });
  } catch (error) {
    console.error("[SMS Error]", {
      code: error.code,
      message: error.message,
      status: error.status
    });

    // Handle Twilio-specific errors gracefully
    let userMessage = "Failed to send SMS.";
    if (error.message?.includes('Invalid phone number') || error.code === 21211) {
      userMessage = "Invalid phone number. Please check the format.";
    } else if (error.code === 21610) { // Number blacklisted
      userMessage = "This phone number is unable to receive SMS.";
    } else if (error.code === 21612) { // Message rate limit
      userMessage = "SMS rate limit exceeded. Please try again later.";
    } else if (error.code === 21614) { // Unsupported number
      userMessage = "This phone number is not supported.";
    } else if (error.code === 20003 || error.message?.includes('credentials')) {
      userMessage = "SMS service authentication error. Contact administrator.";
    } else if (error.message?.includes('TWILIO')) {
      userMessage = "SMS service configuration error. Contact administrator.";
    }

    res.status(500).json({
      success: false,
      message: userMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Test SMS endpoint for debugging
 * @route   POST /api/messages/test
 * @access  Private (Admin only)
 */
export const testSMS = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "Phone number is required for testing.",
        example: "Use format: +250788123456"
      });
    }

    const timestamp = new Date().toISOString();
    const testMessage = `🔔 UniCore Test SMS\nTime: ${timestamp}\nStatus: Twilio connection OK!`;

    const result = await sendSMSViaTwilio(phoneNumber, testMessage);

    console.log(`[SMS Test] ✅ Sent to ${result.to} (SID: ${result.sid})`);

    res.status(200).json({
      success: true,
      message: result.mockMode ? "Mock SMS sent successfully!" : "Test SMS sent successfully!",
      sid: result.sid,
      to: result.to,
      timestamp: timestamp,
      twilioStatus: result.status,
      mockMode: result.mockMode || false,
      quotaRemaining: result.quotaRemaining
    });
  } catch (error) {
    console.error("[SMS Test Error]", {
      code: error.code,
      message: error.message,
      status: error.status
    });

    // Provide helpful error messages
    let errorType = "unknown";
    let userMessage = "Failed to send test SMS.";
    
    if (error.message?.includes('Invalid phone number') || error.code === 21211) {
      errorType = "invalid_phone";
      userMessage = "Invalid phone number format. Use E.164 format (e.g., +250788123456)";
    } else if (error.code === 21610) {
      errorType = "blacklisted";
      userMessage = "This phone number is blacklisted by Twilio.";
    } else if (error.code === 21612) {
      errorType = "rate_limit";
      userMessage = "Twilio rate limit exceeded. Please wait and try again.";
    } else if (error.code === 20003 || error.message?.includes('credentials') || error.message?.includes('Authentication')) {
      errorType = "auth_error";
      userMessage = "Twilio authentication failed. Check TWILIO_SID and TWILIO_AUTH_TOKEN in .env";
    } else if (error.message?.includes('TWILIO') || error.message?.includes('not configured')) {
      errorType = "config_error";
      userMessage = "Twilio not configured. Set TWILIO_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env";
    }

    res.status(500).json({
      success: false,
      message: userMessage,
      errorType,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        message: error.message,
        status: error.status
      } : undefined
    });
  }
};

/**
 * @desc    Mock Test SMS - Always works without Twilio
 * @route   POST /api/messages/mock
 * @access  Private (Admin only)
 */
export const testSMSMock = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required for testing."
      });
    }

    // Clean the phone number
    const cleanedPhone = phoneNumber.replace(/[\s-\(\)]/g, '');

    // Track usage
    await SystemSettings.findOneAndUpdate(
      { key: 'sms' },
      { $inc: { 'data.smsQuota.used': 1 } },
      { new: true, upsert: true }
    );

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockSid = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`📱 [SMS MOCK] Test sent to ${cleanedPhone} (SID: ${mockSid})`);

    res.status(200).json({
      success: true,
      message: "Mock SMS sent successfully!",
      sid: mockSid,
      to: cleanedPhone,
      timestamp: new Date().toISOString(),
      twilioStatus: 'mock_success',
      mockMode: true,
      quotaRemaining: 9999,
      note: "This is a mock test - no real SMS was sent"
    });
  } catch (error) {
    console.error("[SMS Mock Error]", error);
    res.status(500).json({
      success: false,
      message: "Mock test failed: " + error.message
    });
  }
};
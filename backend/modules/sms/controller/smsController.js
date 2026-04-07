import { sendSMSViaTwilio } from '../../../services/smsService.js';

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
// In production: import twilio from 'twilio';
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * @desc    Send SMS to a lecturer
 * @route   POST /api/messages/sms
 * @access  Private (HOD/Admin)
 */
export const sendSMS = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ message: "Phone number and message are required." });
    }

    // PRODUCTION IMPLEMENTATION:
    /*
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    */

    // SIMULATED DELAY FOR UI TESTING
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`[SMS MOCK] Sent to ${phoneNumber}: "${message}"`);

    res.status(200).json({ success: true, message: "SMS sent successfully." });
  } catch (error) {
    console.error("SMS Error:", error);
    res.status(500).json({ message: "Failed to send SMS." });
  }
};
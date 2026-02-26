import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendUrgentSMS = async (messageText) => {
  const messageOptions = {
    from: process.env.TWILIO_NUMBER,
    to: process.env.TO_NUMBER,
    body: messageText,
  };

  try {
    const response = await client.messages.create(messageOptions);
    console.log(`SMS Sent to ${process.env.TO_NUMBER}`);
    return response;
  } catch (error) {
    console.error("SMS Failed:", error.message);
    throw error;
  }
};

export { sendUrgentSMS };

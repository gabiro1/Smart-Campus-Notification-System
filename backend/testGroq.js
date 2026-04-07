import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function testGroq() {
  try {
    const res = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: "Say hello in one sentence" },
      ],
    });

    console.log("✅ Groq works:");
    console.log(res.choices[0].message.content);
  } catch (err) {
    console.error("❌ Groq failed:");
    console.error(err);
  }
}

testGroq();
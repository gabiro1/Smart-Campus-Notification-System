import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function testQwen() {
  try {
    const response = await client.chat.completions.create({
      model: "qwen/qwen3.6-plus:free",
      messages: [{ role: "user", content: "Say hello in one sentence" }],
      max_tokens: 50,
      temperature: 0.4,
    });

    const msg = response?.choices?.[0]?.message?.content;
    if (msg) {
      console.log("✅ OpenRouter (Qwen) works:");
      console.log(msg);
    } else {
      console.warn("⚠️ OpenRouter returned no message:", response);
    }

  } catch (err) {
    console.error("❌ OpenRouter (Qwen) failed:");
    console.error(err);
  }
}

testQwen();
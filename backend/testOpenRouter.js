import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function testOpenRouter() {
  try {
    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        { role: "user", content: "Say hello in one sentence" },
      ],
      max_tokens: 50,
      temperature: 0.4,
    });

    console.log("✅ OpenRouter works:");
    console.log(response.choices[0].message.content);

  } catch (err) {
    console.error("❌ OpenRouter failed:");
    console.error(err);
  }
}

testOpenRouter();
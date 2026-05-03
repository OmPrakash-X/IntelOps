import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { config } from "../config/config.js";


const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: config.GEMINI_API_KEY,
  maxRetries: 2,
  temperature: 0.2,
});

// Build model with optional Mistral fallback
let aiModel;

if (config.MISTRAL_API_KEY) {
  const mistral = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: config.MISTRAL_API_KEY,
    maxRetries: 1,
    temperature: 0.2,
  });
  // LangChain withFallbacks: if Gemini throws, Mistral is tried automatically
  aiModel = gemini.withFallbacks({ fallbacks: [mistral] });
  console.log("[AI] Model ready: Gemini 2.5 Flash (+ Mistral fallback)");
} else {
  aiModel = gemini;
  console.log("[AI] Model ready: Gemini 2.5 Flash (no fallback configured)");
}

export default aiModel;

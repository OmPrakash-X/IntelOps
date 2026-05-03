import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
}
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL is not defined");
}

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined — required for AI features");
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || null
}
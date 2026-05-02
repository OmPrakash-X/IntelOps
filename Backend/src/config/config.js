import dotenv from 'dotenv';
dotenv.config();

if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined");
}
if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined");
}

if(!process.env.CLIENT_URL){
    throw new Error("CLIENT_URL is not defined");
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL
}
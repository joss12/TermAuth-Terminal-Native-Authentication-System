// src/config/env.js
//import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import "../utils/env.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to find .env file in project root
const envPath = join(__dirname, "../../.env");

// Check if file exists
if (!fs.existsSync(envPath)) {
    console.error(`❌ .env file not found at: ${envPath}`);
    console.error(`Current directory: ${process.cwd()}`);
    process.exit(1);
}

// Load the .env file
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("❌ Error loading .env:", result.error.message);
    process.exit(1);
}

const loadedVars = Object.keys(result.parsed || {}).length;
console.log(`✅ Loaded ${loadedVars} environment variables from .env`);

// Export all env vars for easy access
export const env = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    MAIL_PROVIDER: process.env.MAIL_PROVIDER,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASS: process.env.GMAIL_PASS,
    GMAIL_FROM_NAME: process.env.GMAIL_FROM_NAME,
    NAVER_USER: process.env.NAVER_USER,
    NAVER_PASS: process.env.NAVER_PASS,
    NAVER_FROM_NAME: process.env.NAVER_FROM_NAME,
};

// Verify critical variables are loaded
const requiredVars = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
];
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error(
        `❌ Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
}

// src/cli/qrcode.js
import fs from "fs";
import chalk from "chalk";
import qrcode from "qrcode-terminal";
import crypto from "crypto";
import { getLoggedInUser } from "../utils/session.js";

const QR_CODES_FILE = ".qr-codes.json";

function generateSerialCode(length = 4) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function generateQRCode() {
    console.clear();
    console.log(chalk.blue.bold("\nTermAuth - QR Code Generator\n"));

    const user = getLoggedInUser();

    if (!user) {
        console.log(chalk.red("No logged-in user found."));
        return;
    }

    const serial = generateSerialCode();
    const expiresAt = Date.now() + 2 * 60 * 1000; // 2 mins

    let existing = [];
    if (fs.existsSync(QR_CODES_FILE)) {
        try {
            existing = JSON.parse(fs.readFileSync(QR_CODES_FILE, "utf8"));
        } catch {
            existing = [];
        }
    }

    // Remove expired codes
    existing = existing.filter((entry) => entry.expiresAt > Date.now());

    // Add new code
    existing.push({ serial, email: user.email, expiresAt });

    fs.writeFileSync(QR_CODES_FILE, JSON.stringify(existing, null, 2));

    console.log(chalk.green("Scan this QR code to login with your serial:"));
    qrcode.generate(serial, { small: true });

    console.log(chalk.yellow(`Serial: ${serial}`));
    console.log(chalk.gray("Valid for 2 minutes only."));
}

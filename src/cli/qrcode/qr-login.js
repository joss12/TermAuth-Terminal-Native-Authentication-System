// src/cli/qr-login.js
import inquirer from "inquirer";
import chalk from "chalk";
import bcrypt from "bcrypt";
import qrcode from "qrcode-terminal";

import { pool } from "../../models/db.js";
import { getUserBySerial, clearOldSerials } from "../../models/userModel.js";
import { generateToken } from "../../services/auth.js";
import { saveSessionToken } from "../../utils/session.js";

function generateRandomSerial() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let serial = "";
    for (let i = 0; i < 4; i++) {
        serial += chars[Math.floor(Math.random() * chars.length)];
    }
    return serial;
}

async function saveSerialToUser(email, serial) {
    const expiration = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiration
    await pool.query(
        `UPDATE users SET qr_serial = $1, qr_expires_at = $2 WHERE email = $3`,
        [serial, expiration, email],
    );
}

export async function qrCodeLogin() {
    console.clear();
    console.log(chalk.blue.bold("\n📲 QR Code Login\n"));

    const { email } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter your email address:",
        },
    ]);

    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
    ]);
    if (userRes.rows.length === 0) {
        console.log(chalk.red("❌ Email not found."));
        return;
    }

    //const user = userRes.rows[0];

    // Step 1: clear expired serials
    await clearOldSerials();

    // Step 2: generate serial and QR code
    const serial = generateRandomSerial();
    await saveSerialToUser(email, serial);

    console.log(chalk.gray("\nScan this QR code with your phone:"));
    qrcode.generate(serial, { small: true });
    console.log(chalk.cyan(`\nQR Code contains: ${serial}`));

    // Step 3: ask for serial input
    const { enteredSerial } = await inquirer.prompt([
        {
            type: "input",
            name: "enteredSerial",
            message: "Enter the 4-character serial from your phone:",
            validate: (input) =>
                /^[A-Z0-9]{4}$/.test(input.toUpperCase()) ||
                "Serial must be 4 alphanumeric characters",
        },
    ]);

    const found = await getUserBySerial(enteredSerial.toUpperCase());

    if (!found || found.email !== email) {
        console.log(chalk.red("❌ Invalid or expired serial."));
        return;
    }

    // Step 4: ask for password confirmation
    const { password } = await inquirer.prompt([
        {
            type: "password",
            name: "password",
            message: "Enter your password to confirm login:",
            mask: "*",
        },
    ]);

    const isMatch = await bcrypt.compare(password, found.password);
    if (!isMatch) {
        console.log(chalk.red("❌ Incorrect password."));
        return;
    }

    const token = generateToken(found);
    saveSessionToken(token);

    console.log(
        chalk.green(
            `\n✅ Logged in as ${found.email} (Role: ${found.role}) via QR Code\n`,
        ),
    );
}

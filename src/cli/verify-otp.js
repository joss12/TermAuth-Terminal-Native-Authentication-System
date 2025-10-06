import inquirer from "inquirer";
import chalk from "chalk";
import { pool } from "../models/db.js";

import "../utils/env.js"; // Just import, don't call config() again

//import dotenv from "dotenv";

//dotenv.config();

async function verifyOtp() {
    console.clear();
    console.log(chalk.blue.bold("\n TermAuth - Verify OTP\n"));
    const { email, otp } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter your email:",
            validate: (input) =>
                /\S+@\S+\.\S+/.test(input) || "Please enter a valid email.",
        },
        {
            type: "input",
            name: "otp",
            message: "Enter the 6-digit OTP sent to your email:",
            validate: (input) =>
                /^\d{6}$/.test(input) || "OTP must be a 6-digit number.",
        },
    ]);

    try {
        // Step 1: Find user
        const userRes = await pool.query(
            "SELECT id, is_verified FROM users WHERE email = $1",
            [email],
        );

        if (userRes.rows.length === 0) {
            console.log(chalk.red("❌ Email not found."));
            process.exit(1);
        }

        const user = userRes.rows[0];

        if (user.is_verified) {
            console.log(chalk.yellow(`${email} is already verified.`));
            process.exit(0);
        }

        // Step 2: Find OTP
        const otpRes = await pool.query(
            "SELECT * FROM otps WHERE user_id = $1 AND otp = $2",
            [user.id, otp],
        );

        if (otpRes.rows.length === 0) {
            console.log(chalk.red("❌ Invalid OTP."));
            process.exit(1);
        }

        const otpRecord = otpRes.rows[0];

        if (new Date() > new Date(otpRecord.expires_at)) {
            console.log(chalk.red("❌ OTP has expired."));
            process.exit(1);
        }

        // Step 3: Mark user as verified
        await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [
            user.id,
        ]);

        // Step 4: Delete used OTP
        await pool.query("DELETE FROM otps WHERE id = $1", [otpRecord.id]);

        console.log(chalk.green("✅ Email verified successfully!"));
    } catch (err) {
        console.error(chalk.red("Error verifying OTP:"), err.message);
        process.exit(1);
    }
}

if (import.meta.url === process.argv[1]) {
    verifyOtp();
}

export { verifyOtp };

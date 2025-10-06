import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import jwt from "jsonwebtoken";
import { pool } from "../models/db.js";
import { createUser, getUserByEmail } from "../models/userModel.js";
import { sendOTP } from "../services/mailer.js";

import "../utils/env.js"; // Just import, don't call config() again

//import dotenv from "dotenv";
import crypto from "crypto";

//dotenv.config();

const SESSION_FILE = ".termauth-session";

async function register() {
    console.clear();
    console.log(chalk.blue.bold("\n TermAuth - Register\n"));

    const { email, password } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter your email:",
            validate: (input) => input.trim() !== "" || "Email is required.",
        },
        {
            type: "password",
            name: "password",
            message: "Enter your password:",
            mask: "*",
        },
    ]);

    const existing = await getUserByEmail(email);
    if (existing) {
        console.log(chalk.red("Email already registered. Please login."));
        return;
    }

    const user = await createUser(email, password); // role defaults to 'pending'

    // ✅ Create OTP
    const otp = crypto.randomInt(100_000, 999_999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await pool.query(
        `INSERT INTO otps (user_id, otp, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, otp, expiresAt],
    );

    console.log(chalk.yellow(`\nVerification OTP sent to: ${email}`));
    await sendOTP(email, otp); // ✅ Use real mailer!

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
    );

    fs.writeFileSync(SESSION_FILE, token);
    console.log(
        chalk.green(`\nRegistration complete. Please verify your email.`),
    );
    console.log(chalk.gray(`Session token saved to ${SESSION_FILE}\n`));
}

export { register };

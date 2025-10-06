// src/cli/reset-request.js
import inquirer from "inquirer";
import chalk from "chalk";
import jwt from "jsonwebtoken";
import { pool } from "../models/db.js";
import { sendPasswordReset } from "../utils/mailer.js";
import "../utils/env.js"; // Just import, don't call config() again

//import dotenv from "dotenv";
//dotenv.config({ quiet: true });

async function requestPasswordReset() {
    console.clear();
    console.log(chalk.blue.bold("\n TermAuth - Reset Password Request\n"));
    const { email } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter your email:",
        },
    ]);

    // Check if user exists
    const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [
        email,
    ]);

    if (rows.length === 0) {
        console.log(chalk.red("No user found with this email."));
        process.exit(1);
    }

    // Create JWT reset token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });

    await sendPasswordReset(email, token);
    console.log(chalk.green("\n✔ Reset link sent to your email."));
}

if (import.meta.url === process.argv[1]) {
    requestPasswordReset();
}

export { requestPasswordReset };

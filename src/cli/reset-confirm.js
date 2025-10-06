// ✅ Correctly imports everything needed
import inquirer from "inquirer";
import chalk from "chalk";
import bcrypt from "bcrypt";
import { pool } from "../models/db.js";

import "../utils/env.js"; // Just import, don't call config() again

//import dotenv from "dotenv";
//dotenv.config({ quiet: true });

async function confirmPasswordReset() {
    console.clear(); // ✅ moved into the function to avoid auto-run
    console.log(chalk.blue.bold("\n TermAuth - Confirm Password Reset\n"));

    const { email, token, newPassword } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter your email:",
        },
        {
            type: "input",
            name: "token",
            message: "Enter the reset token you received:",
        },
        {
            type: "password",
            name: "newPassword",
            message: "Enter your new password:",
            mask: "*",
        },
    ]);

    try {
        const result = await pool.query(
            `SELECT * FROM otps 
         WHERE otp = $1 AND expires_at > NOW()`,
            [token],
        );

        if (result.rows.length === 0) {
            console.log(chalk.red("Invalid or expired token."));
            process.exit(1);
        }

        const otpEntry = result.rows[0];

        const userRes = await pool.query(
            "SELECT id, email FROM users WHERE id = $1",
            [otpEntry.user_id],
        );

        if (
            userRes.rows.length === 0 ||
            userRes.rows[0].email.toLowerCase() !== email.toLowerCase()
        ) {
            console.log(chalk.red("Token does not match the email address."));
            process.exit(1);
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
            passwordHash,
            otpEntry.user_id,
        ]);

        await pool.query("DELETE FROM otps WHERE expires_at < NOW()");

        console.log(
            chalk.green("\n✅ Password reset successful!\nYou can now login.\n"),
        );
    } catch (err) {
        console.error(chalk.red("Error confirming reset:"), err.message);
    }
}

if (import.meta.url === process.argv[1]) {
    confirmPasswordReset();
}

export { confirmPasswordReset };

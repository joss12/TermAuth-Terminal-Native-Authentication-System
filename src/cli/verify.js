import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import jwt from "jsonwebtoken";
import { pool } from "../models/db.js";
import "../utils/env.js"; // Just import, don't call config() again

//import dotenv from "dotenv";

//dotenv.config();

const SESSION_FILE = ".termauth-session";

async function verifyUser() {
    console.clear();
    console.log(chalk.blue.bold("\n TermAuth - Verify User\n"));

    //Check session
    if (!fs.existsSync(SESSION_FILE)) {
        console.log(chalk.red("No active session  found. Please login"));
        return;
    }

    let payload;
    try {
        const token = fs.readFileSync(SESSION_FILE, "utf-8");
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.log(chalk.red("Invalid or expired session token."));
        return;
    }

    //Check role
    if (payload.role !== "admin") {
        console.log(chalk.red("Access denied. Only admins can verify users."));
        return;
    }

    const { email } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter the email of the user to verify",
        },
    ]);

    try {
        const { rows } = await pool.query(
            "SELECT id, is_verified FROM users WHERE email = $1",
            [email],
        );

        if (rows.lenght === 0) {
            console.log(chalk.red("User not found"));
            return;
        }

        const user = rows[0];

        if (user.is_verified) {
            console.log(chalk.yellow(`${email} is already verified.`));
            return;
        }
        await pool.query("UPDATE users SET is_verified = true WHERE email = $1", [
            email,
        ]);

        console.log(chalk.green(`${email} has been verified`));
    } catch (err) {
        console.error(chalk.red("Error during verification:"), err.message);
    }
}

export { verifyUser };

import fs from "fs";
import jwt from "jsonwebtoken";
import chalk from "chalk";
import { pool } from "../models/db.js";
//import dotenv from "dotenv";
import "../utils/env.js"; // Just import, don't call config() again

//dotenv.config();

const SESSION_FILE = ".termauth-session";

async function userList() {
    console.clear();
    console.log(chalk.blue.bold("\n TermAuth - User list\n"));

    //1. Ensure session file exists
    if (!fs.existsSync(SESSION_FILE)) {
        console.log(chalk.red("No active session found. Please login first"));
        return;
    }

    let payload;
    try {
        const token = fs.readFileSync(SESSION_FILE, "utf-8");
        payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload.id;
        console.log(userId);
    } catch (err) {
        console.log(chalk.red("Innvalid or expired session token."));
        return;
    }

    //2. Only admin
    if (payload.role !== "admin") {
        console.log(chalk.red("Access denied. Only admins can view all users"));

        return;
    }
    try {
        const result = await pool.query(
            `SELECT id, email, role, is_verified, created_at
            FROM users
            ORDER BY id ASC
            `,
        );

        if (result.rows.length === 0) {
            console.log(chalk.yellow("No users found."));
            return;
        }

        console.log(chalk.green(`Found ${result.rows.length}user(s):\n`));

        result.rows.forEach((user) => {
            console.log(
                `${chalk.cyan("ID")}: ${user.id} | ` +
                `${chalk.cyan("Email")}: ${user.email} | ` +
                `${chalk.cyan("Role")}: ${user.role} | ` +
                `${chalk.cyan("Verified")}: ${user.is_verified ? "✅" : "❌"} | ` +
                `${chalk.cyan("Joined")}: ${new Date(user.created_at).toLocaleString()}`,
            );
        });
    } catch (err) {
        console.error(chalk.red("Error fetching users:"), err.message);
    }
}

export { userList };

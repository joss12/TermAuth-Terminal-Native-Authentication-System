// src/cli/me.js
import fs from "fs";
import chalk from "chalk";
import jwt from "jsonwebtoken";
//import dotenv from "dotenv";

import {
    saveSessionToken,
    readSessionToken,
    decodeSessionToken,
    clearSessionToken,
} from "../utils/session.js";

//dotenv.config();
import "../utils/env.js";
const SESSION_FILE = ".termauth-session";

export async function me() {
    const flag = process.argv[2];

    if (flag === "--clear") {
        if (fs.existsSync(SESSION_FILE)) {
            fs.unlinkSync(SESSION_FILE);
            console.log(chalk.yellow("🔒 Session cleared."));
        } else {
            console.log(chalk.red("No session found to clear."));
        }
        return;
    }

    if (!fs.existsSync(SESSION_FILE)) {
        console.log(chalk.red("❌ No active session found. Please login first."));
        return;
    }

    let payload;
    try {
        const token = fs.readFileSync(SESSION_FILE, "utf-8");
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.log(chalk.red("❌ Invalid or expired session token."));
        return;
    }

    if (flag === "--json") {
        console.log(JSON.stringify(payload));
        return;
    }

    // Default pretty view
    console.clear();
    console.log(chalk.blue.bold("\n TermAuth - Who Am I\n"));
    console.log(`${chalk.bold("Logged in as:")}\n`);
    console.log(`${chalk.cyan("Email")}: ${payload.email}`);
    console.log(`${chalk.cyan("ID")}: ${payload.id}`);
    console.log(`${chalk.cyan("Role")}: ${payload.role}`);
    console.log(
        `${chalk.cyan("Verified")}: ${payload.is_verified ? "Yes" : "?"}`,
    );
    console.log(
        `${chalk.cyan("Joined")}: ${new Date(payload.created_at || payload.iat * 1000).toLocaleString()}`,
    );
}

// Run if invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
    me();
}

import fs from "fs";
import jwt from "jsonwebtoken";
import chalk from "chalk";
import "../utils/env.js";

//import dotenv from "dotenv";
//dotenv.config();

const SESSION_FILE = ".termauth-session";

export async function checkRole(requiredRole) {
    // Read session token
    if (!fs.existsSync(SESSION_FILE)) {
        console.log(chalk.red("No active session. Please login first."));
        process.exit(1);
    }

    const token = fs.readFileSync(SESSION_FILE, "utf-8");

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (payload.role !== requiredRole) {
            console.log(
                chalk.red(
                    `Access denied. Must be ${requiredRole}, but you are ${payload.role}.`,
                ),
            );
            process.exit(1);
        }

        return payload;
    } catch (err) {
        console.error(chalk.red("Invalid or expired session token."), err.message);
        process.exit(1);
    }
}

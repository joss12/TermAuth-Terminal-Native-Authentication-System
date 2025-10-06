// src/cli/export-csv.js
import fs from "fs";
import jwt from "jsonwebtoken";
import chalk from "chalk";
import { pool } from "../models/db.js";
import "../utils/env.js";

//import dotenv from "dotenv";

//dotenv.config();

const SESSION_FILE = ".termauth-session";

async function exportCSV() {
    console.clear();
    console.log(chalk.blue.bold("\n TermAuth - Export Users to CSV\n"));

    // Check for session
    if (!fs.existsSync(SESSION_FILE)) {
        console.log(chalk.red("No active session found. Please login first."));
        return;
    }

    let payload;
    try {
        console.log("Reading session token...");
        const token = fs.readFileSync(SESSION_FILE, "utf-8");
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.log(chalk.red("Invalid or expired session token."));
        return;
    }

    if (payload.role !== "admin") {
        console.log(chalk.red("Access denied. Only admins can export user list."));
        return;
    }

    try {
        console.log("Querying users from database...");
        const result = await pool.query(
            "SELECT id, email, role, is_verified, created_at FROM users",
        );

        console.log(`Found ${result.rows.length} users.`);

        if (result.rows.length === 0) {
            console.log(chalk.yellow("No users to export."));
            return;
        }

        // Format rows as CSV
        const csvRows = [
            "id,email,role,is_verified,created_at", // header
            ...result.rows.map(
                (u) => `${u.id},${u.email},${u.role},${u.is_verified},${u.created_at}`,
            ),
        ];

        console.log("Writing users.csv...");
        fs.writeFileSync("users.csv", csvRows.join("\n"));
        console.log(
            chalk.green(`✅ Exported ${result.rows.length} users to users.csv`),
        );
    } catch (err) {
        console.error(chalk.red("❌ Error exporting users:"), err.message);
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    exportCSV();
}

export { exportCSV as exportToCSV };

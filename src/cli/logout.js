// src/cli/logout.js
import chalk from "chalk";
import { clearSessionToken } from "../utils/session.js";

export async function logout() {
    console.clear();
    console.log(chalk.blue.bold("\n TermAuth - Logout\n"));

    clearSessionToken();
    console.log(chalk.green("Logged out successfully."));
}

//Auto-run when executed directly (not imported)
if (process.argv[1] === new URL(import.meta.url).pathname) {
    logout();
}

// src/cli/update-email.js
import inquirer from "inquirer";
import chalk from "chalk";
import { getUserByEmail, updateUserEmail } from "../models/userModel.js";
import { getLoggedInUser } from "../utils/session.js";

export async function updateEmail() {
    console.clear();
    console.log(chalk.blue.bold("\n✉️  Update Email\n"));

    const user = getLoggedInUser();

    if (!user) {
        console.log(chalk.red("You must be logged in to update your email."));
        return;
    }

    const { newEmail } = await inquirer.prompt([
        {
            type: "input",
            name: "newEmail",
            message: "Enter your new email address:",
            validate: (input) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || "Invalid email format.",
        },
    ]);

    const existing = await getUserByEmail(newEmail);
    if (existing) {
        console.log(chalk.red("This email is already in use by another account."));
        return;
    }

    try {
        const result = await updateUserEmail(user.id, newEmail);
        if (result.rowCount === 0) {
            console.log(chalk.red("Failed to update email."));
        } else {
            console.log(chalk.green("✅ Email updated successfully!"));
            console.log(chalk.yellow("ℹ️ Please verify your new email."));
        }
    } catch (err) {
        console.error(chalk.red("Error updating email:"), err.message);
    }
}

if (import.meta.url === process.argv[1]) {
    updateEmail();
}

// src/cli/demote.js
import inquirer from "inquirer";
import chalk from "chalk";
import { getUserByEmail, updateUserRole } from "../models/userModel.js";
import { sendRoleUpdateEmail } from "../utils/mailer.js";

export async function demoteUser() {
    console.log(chalk.yellow.bold("\n Demote a User\n"));

    const { email } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter the user's email to demote:",
            validate: (input) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ||
                "Please enter a valid email.",
        },
    ]);

    const user = await getUserByEmail(email);
    if (!user) {
        console.log(chalk.red("User not found."));
        return;
    }

    if (user.role !== "admin") {
        console.log(chalk.yellow("User is not an admin."));
        return;
    }

    await updateUserRole(user.id, "user");
    await sendRoleUpdateEmail(email, "user");

    console.log(chalk.green(`User ${email} has been demoted to user.`));
}

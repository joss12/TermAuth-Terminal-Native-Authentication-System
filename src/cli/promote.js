// src/cli/promote.js
import inquirer from "inquirer";
import chalk from "chalk";
import { getUserByEmail, updateUserRole } from "../models/userModel.js";
import { sendRoleUpdateEmail } from "../utils/mailer.js";

export async function promoteUser() {
    console.log(chalk.blue.bold("\n Promote a User\n"));

    const { email } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter the user's email to promote:",
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

    if (user.role === "admin") {
        console.log(chalk.yellow("User is already an admin."));
        return;
    }

    await updateUserRole(user.id, "admin");
    await sendRoleUpdateEmail(email, "admin");

    console.log(chalk.green(`User ${email} has been promoted to admin.`));
}

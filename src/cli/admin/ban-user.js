// src/cli/ban-user.js
import inquirer from "inquirer";
import chalk from "chalk";
import { getUserByEmail, updateUserRole } from "../../models/userModel.js";
import { sendRoleUpdateEmail } from "../../utils/mailer.js";

export async function banUser() {
    console.log(chalk.red.bold("\n Ban a User\n"));

    const { email } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter the user's email to ban:",
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

    if (user.role === "banned") {
        console.log(chalk.yellow("User is already banned."));
        return;
    }

    await updateUserRole(user.id, "banned");
    await sendRoleUpdateEmail(email, "banned");

    console.log(chalk.green(`User ${email} has been banned.`));
}

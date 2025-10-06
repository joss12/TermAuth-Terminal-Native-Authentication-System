// src/cli/change-role.js
import inquirer from "inquirer";
import chalk from "chalk";
import { getUserByEmail, updateUserRole } from "../models/userModel.js";
import { getLoggedInUser } from "../utils/session.js";

const VALID_ROLES = ["admin", "user", "auditor", "pending", "banned"];

export async function changeUserRole() {
    console.clear();
    console.log(chalk.blue.bold("\n TermAuth - Change User Role\n"));

    const currentUser = getLoggedInUser();
    if (!currentUser || currentUser.role !== "admin") {
        console.log(chalk.red("Only admin users can change roles."));
        return;
    }

    const { email } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter email of the user to change role",
            validate: (input) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ||
                "Please enter a valid email address.",
        },
    ]);

    const user = await getUserByEmail(email);
    if (!user) {
        console.log(chalk.red("User not found."));
        return;
    }

    console.log(chalk.yellow(`Current role: ${user.role}`));

    const { newRole } = await inquirer.prompt([
        {
            type: "list",
            name: "newRole",
            message: "Select new role for this user",
            choices: VALID_ROLES.filter((role) => role !== user.role),
        },
    ]);

    try {
        await updateUserRole(email, newRole);
        console.log(
            chalk.green(
                `✅ Role updated successfully to "${newRole}" for user ${email}`,
            ),
        );
    } catch (err) {
        console.error(chalk.red("Failed to update role:"), err.message);
    }
}

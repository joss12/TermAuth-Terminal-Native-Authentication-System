//import inquirer from "inquirer";
//import chalk from "chalk";
//import { getUserByEmail, updateUserRole } from "../../models/userModel.js";
//
//export async function unbanUser() {
//    console.log(chalk.green.bold("\n Unban a User\n"));
//
//    const { email } = await inquirer.prompt([
//        {
//            type: "input",
//            name: "email",
//            message: "Enter the user's email to unban:",
//            validate: (input) =>
//                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ||
//                "Please enter a valid email.",
//        },
//    ]);
//
//    const user = await getUserByEmail(email);
//    if (!user) {
//        console.log(chalk.red("User not found."));
//        return;
//    }
//
//    if (user.role !== "banned") {
//        console.log(chalk.yellow("User is not banned."));
//        return;
//    }
//
//    //You can default to 'pending' or 'user'
//    await updateUserRole(user.id, "pending");
//    console.log(chalk.green(`User ${email} has been unbanned.`));
//}

// src/cli/unban-user.js
import inquirer from "inquirer";
import chalk from "chalk";
import { getUserByEmail, updateUserRole } from "../../models/userModel.js";
import { sendRoleUpdateEmail } from "../../utils/mailer.js";

export async function unbanUser() {
    console.log(chalk.green.bold("\n Unban a User\n"));

    const { email } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter the user's email to unban:",
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

    if (user.role !== "banned") {
        console.log(chalk.yellow("User is not banned."));
        return;
    }

    await updateUserRole(user.id, "pending"); // Or "user"
    await sendRoleUpdateEmail(email, "pending");

    console.log(chalk.green(`User ${email} has been unbanned.`));
}

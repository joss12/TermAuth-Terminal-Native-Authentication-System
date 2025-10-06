// src/cli/login.js
import chalk from "chalk";
import inquirer from "inquirer";
import bcrypt from "bcrypt";
//import dotenv from "dotenv";
import { getUserByEmail } from "../models/userModel.js";
import { generateToken } from "../services/auth.js";
import { saveSessionToken } from "../utils/session.js";
import "../utils/env.js";
//dotenv.config({ quiet: true });

export async function loginFlow() {
    console.clear();
    console.log(chalk.blue.bold("\n TermAuth - Login\n"));

    const { email, password } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter your email",
            validate: (input) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ||
                "Please enter a valid email.",
        },
        {
            type: "password",
            name: "password",
            message: "Enter your password",
            mask: "*",
        },
    ]);

    try {
        const user = await getUserByEmail(email);

        if (!user) {
            console.log(chalk.red("No user found with that email."));
            return;
        }
        if (!user.is_verified) {
            console.log(
                chalk.yellow(
                    "Your account is not verified. Please check your email for the OTP.",
                ),
            );
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(chalk.red("Incorrect password"));
            return;
        }

        console.log(chalk.green(`\nLogin successful! Welcome, ${user.email}`));
        console.log(chalk.blue(`Role: ${user.role}`));

        const token = generateToken(user);
        saveSessionToken(token); // ✅ use helper
        console.log(chalk.green("Session token saved to .termauth-session\n"));
    } catch (err) {
        console.log(chalk.red("Login Failed"), err.message);
    }
}

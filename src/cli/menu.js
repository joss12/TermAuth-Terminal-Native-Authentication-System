// src/cli/menu.js
import inquirer from "inquirer";
import chalk from "chalk";
import boxen from "boxen";
import fs from "fs";
import jwt from "jsonwebtoken";
//import dotenv from "dotenv";

import { register } from "./register.js";
import { verifyOtp } from "./verify-otp.js";
import { loginFlow } from "./login.js";
import { me } from "./me.js";
import { promoteUser } from "./promote.js";
import { demoteUser } from "./demote.js";
import { userList } from "./user-list.js";
import { verifyUser } from "./verify.js";
import { requestPasswordReset } from "./reset-request.js";
import { confirmPasswordReset } from "./reset-confirm.js";
import { logout } from "./logout.js";
import { exportToCSV } from "./export-csv.js";
import { banUser } from "./admin/ban-user.js";
import { unbanUser } from "./admin/unban-user.js";
import { changeUserRole } from "./change-role.js";
import { updateEmail } from "./update-email.js";
import { qrCodeLogin } from "./qrcode/qr-login.js";

import { decodeSessionToken } from "../utils/session.js";

import "../utils/env.js";

//dotenv.config();

export async function mainMenu() {
    console.clear();

    const banner = boxen(
        chalk.bold.green("\ud83d\udce6 TermAuth - Terminal Native Auth CLI"),
        {
            padding: 1,
            borderColor: "cyan",
            borderStyle: "round",
            align: "center",
        },
    );

    let currentRole = null;
    const token = fs.existsSync(".termauth-session")
        ? fs.readFileSync(".termauth-session", "utf8")
        : null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            currentRole = decoded.role;
        } catch {
            currentRole = null;
        }
    }

    const coreActions = [
        { name: "Register", value: "register" },
        { name: "Login", value: "login" },
        { name: "QR Code Login", value: "qrLogin" },
        { name: "Reset Email/Password", value: "reset" },
        { name: "Confirm Reset", value: "confirmReset" },
        { name: "Exit", value: "exit" },
    ];

    const userDashboard = [
        { name: "Logout", value: "logout" },
        { name: "Me", value: "me" },
        { name: "Reset Password", value: "reset" },
        { name: "Confirm Reset", value: "confirmReset" },
        { name: "Update Email", value: "updateEmail" },
        { name: "Export User to CSV", value: "csv" },
        { name: "Exit", value: "exit" },
    ];

    const adminActions = [
        { name: "Promote User", value: "promote" },
        { name: "Demote User", value: "demote" },
        { name: "Change User Role", value: "changeRole" },
        { name: "Ban User", value: "banUser" },
        { name: "Unban User", value: "unbanUser" },
        { name: "Verify User", value: "verifyUser" },
        { name: "List Users", value: "list" },
        { name: "Reset Password", value: "reset" },
        { name: "Confirm Reset", value: "confirmReset" },
        { name: "Update Email", value: "updateEmail" },
        { name: "Export All Users to CSV", value: "csv" },
        { name: "Logout", value: "logout" },
        { name: "Exit", value: "exit" },
    ];

    const actions =
        currentRole === "admin"
            ? adminActions
            : currentRole === "user" || currentRole === "pending"
                ? userDashboard
                : coreActions;

    while (true) {
        console.log(banner);

        const { action } = await inquirer.prompt([
            {
                type: "list",
                name: "action",
                message: "Choose an action:",
                choices: actions,
                pageSize: 12,
            },
        ]);

        console.clear();

        switch (action) {
            case "register":
                await register();
                break;
            case "login":
                await loginFlow();
                break;
            case "qrLogin":
                await qrCodeLogin();
                break;
            case "me":
                await me();
                break;
            case "promote":
                await promoteUser();
                break;
            case "demote":
                await demoteUser();
                break;
            case "banUser":
                await banUser();
                break;
            case "unbanUser":
                await unbanUser();
                break;
            case "changeRole":
                await changeUserRole();
                break;
            case "list":
                await userList();
                break;
            case "verifyUser":
                await verifyUser();
                break;
            case "reset":
                await requestPasswordReset();
                break;
            case "confirmReset":
                await confirmPasswordReset();
                break;
            case "csv":
                await exportToCSV();
                break;
            case "logout":
                await logout();
                break;
            case "updateEmail":
                await updateEmail();
                break;
            case "exit":
                console.log(
                    chalk.green("\n\ud83d\udc4b Goodbye! Thanks for using TermAuth!\n"),
                );
                process.exit(0);
        }

        console.log(chalk.gray("\nPress any key to return to the main menu..."));
        await new Promise((resolve) => {
            if (process.stdin.isTTY) process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.once("data", () => {
                if (process.stdin.isTTY) process.stdin.setRawMode(false);
                process.stdin.pause();
                resolve();
            });
        });

        console.clear();
    }
}

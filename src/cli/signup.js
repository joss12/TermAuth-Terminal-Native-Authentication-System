import inquirer from "inquirer";
import chalk from "chalk";
import { createUser } from "../models/userModel.js";
import { generateOTP, saveOTP, verifyOTP } from "../services/otpService.js";
import { sendMail } from "../services/mailer.js";
import { pool } from "../models/db.js";
import "../utils/env.js"; // Just import, don't call config() again

//dotenv.config({ quiet: true });

export async function signupFlow() {
    console.clear();
    console.log(chalk.blue.bold("\n🔐 TermAuth - Sign Up\n"));

    const { email, password } = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Enter your email:",
        },
        {
            type: "password",
            name: "password",
            message: "Create a password:",
            mask: "*",
        },
    ]);

    try {
        // 1. Create user
        const user = await createUser(email, password, "pending");

        // 🔍 Confirm user.id exists
        if (!user || !user.id) {
            throw new Error("User creation failed: missing ID");
        }

        // 2. Generate and store OTP
        const otp = generateOTP();
        await saveOTP(user.id, otp);

        const html = `
      <h2>🎉 TermAuth Email Verification</h2>
      <p>Hello, ${user.email}</p>
      <p>Your one-time password (OTP) is:</p>
      <h3>${otp}</h3>
      <p>This code will expire in 5 minutes.</p>
    `;

        await sendMail(user.email, "✅ Verify your TermAuth account", html);
        console.log(chalk.green(`📬 OTP sent to ${user.email}`));
        console.log(chalk.yellow(`🧪 [DEV] OTP: ${otp}`));

        let attempts = 0;
        let verified = false;

        while (attempts < 3 && !verified) {
            const { otpInput } = await inquirer.prompt([
                {
                    type: "input",
                    name: "otpInput",
                    message: "Enter the OTP from your email:",
                },
            ]);

            verified = await verifyOTP(user.id, otpInput);
            console.log("Debug - verifyOTP returned:", verified);

            if (!verified) {
                console.log(chalk.red("❌ Invalid OTP. Try again."));
                attempts++;
            }
        }

        if (!verified) {
            console.log(chalk.red("🚫 Too many failed attempts."));
            return;
        }

        // ✅ 3. Mark user as verified

        await pool.query("UPDATE users SET is_verified = $1 WHERE id = $2", [
            true,
            user.id,
        ]);

        // ✅ 4. Cleanup OTP
        await pool.query("DELETE FROM otps WHERE user_id = $1", [user.id]);

        console.log(chalk.green("✅ Email verified! Your account is now active."));
    } catch (err) {
        if (err.code === "23505") {
            console.log(chalk.red("⚠️ Email already exists. Try logging in."));
        } else {
            console.error(chalk.red("❌ Signup failed:"), err.message);
            console.error(err);
        }
    }
}

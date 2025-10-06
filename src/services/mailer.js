import nodemailer from "nodemailer";
import "../utils/env.js";

//import dotenv from "dotenv";
//dotenv.config({ quiet: true }); // 💥 Don't miss this

let transporter;

if (process.env.MAIL_PROVIDER === "gmail") {
    transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });
} else if (process.env.MAIL_PROVIDER === "naver") {
    transporter = nodemailer.createTransport({
        host: "smtp.naver.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.NAVER_USER,
            pass: process.env.NAVER_PASS,
        },
    });
} else {
    throw new Error("Invalid MAIL_PROVIDER in .env");
}

export async function sendMail(to, subject, html) {
    const from =
        process.env.MAIL_PROVIDER === "gmail"
            ? process.env.GMAIL_USER
            : process.env.NAVER_USER;

    await transporter.sendMail({
        from: `"TermAuth Korea" <${from}>`,
        to,
        subject,
        html,
    });
}

export async function sendOTP(email, otp) {
    const subject = "🧪 Your TermAuth Verification Code";
    const html = `
    <h2>Welcome to TermAuth</h2>
        <p>Use the following OTP to verify your account:</p>
        <h1 style="letter-spacing: 2px;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
    `;
    await sendMail(email, subject, html);
}

export async function sendRoleUpdateEmail(to, newRole) {
    const subject = "Your Role Has Been Updated";
    const text = `Hello,\nYour account role has been update to: ${newRole}\n\n- Termauth Team`;

    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        text,
    });
}

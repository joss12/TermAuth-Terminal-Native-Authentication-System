import { sendMail } from "../services/mailer.js";

// src/utils/mailer.js
export async function sendPasswordReset(to, token) {
    const resetLink = `http://localhost/reset-password?token=${token}`;
    const html = `
        <h2>Reset Your Password</h2>
        <p>Use this token in the terminal:</p>
        <pre style="font-size:18px;"><b>${token}</b></pre>
        <p>This will expire in 15 minutes.</p>
    `;
    await sendMail(to, "TermAuth - Password Reset", html);
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

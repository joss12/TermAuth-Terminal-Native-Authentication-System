import crypto from "crypto";
import { pool } from "../models/db.js";

export function generateOTP(length = 6) {
    return crypto.randomInt(100000, 999999).toString().padStart(length, "0");
}

export async function saveOTP(userId, otp) {
    // Clean up old OTPs for this user first
    await pool.query("DELETE FROM otps WHERE user_id = $1", [userId]);

    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min from now

    await pool.query(
        "INSERT INTO otps (user_id, otp, expires_at) VALUES ($1, $2, $3)",
        [userId, otp, expires],
    );
}

export async function verifyOTP(userId, otp) {
    const query = `
        SELECT * FROM otps
        WHERE user_id = $1 AND otp = $2
        ORDER BY expires_at DESC LIMIT 1
    `;

    const { rows } = await pool.query(query, [userId, otp]);

    // Manual expiration check
    if (rows.length > 0) {
        const otpRecord = rows[0];
        const now = new Date();
        const expiresAt = new Date(otpRecord.expires_at);

        console.log("🔍 Time check:", { now, expiresAt, isValid: now < expiresAt });

        return now < expiresAt;
    }

    return false;
}

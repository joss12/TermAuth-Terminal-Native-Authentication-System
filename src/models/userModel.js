import bcrypt from "bcrypt";
import { pool } from "./db.js";

export async function createUser(email, password, role = "pending") {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
    INSERT INTO users (email, password, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, role, created_at
  `;

    const values = [email, hashedPassword, role];

    const { rows } = await pool.query(query, values);
    return rows[0];
}

export async function getUserByEmail(email) {
    const query = `
        SELECT id, email, password, role, is_verified
        FROM users
        WHERE email = $1
    `;

    const res = await pool.query(query, [email]);
    return res.rows[0];
}

export async function getUserById(id) {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return res.rows[0];
}

export async function updateUserEmail(userId, newEmail) {
    return await db.query(
        "UPDATE users SET email = $1 WHERE id = $2 RETURNING *",
        [newEmail, userId],
    );
}

export async function updateUserRole(email, newRole) {
    const result = await db.query("UPDATE users SET role = $1 WHERE email = $2", [
        newRole,
        email,
    ]);
    return result.rowCount > 0;
}

export async function getUserBySerial(serial) {
    const result = await pool.query(
        `SELECT * FROM users WHERE qr_serial = $1 AND qr_expires_at > NOW()`,
        [serial],
    );
    return result.rows[0];
}

export async function clearOldSerials() {
    await pool.query(`
    UPDATE users 
    SET qr_serial = NULL, qr_expires_at = NULL 
    WHERE qr_expires_at < NOW()
  `);
}

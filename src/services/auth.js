import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "supersecretkey";

export function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, secret, { expiresIn: "1h" });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
}

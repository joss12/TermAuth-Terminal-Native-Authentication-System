// src/utils/session.js
import fs from "fs";
import jwt from "jsonwebtoken";
import "../utils/env.js";
//import dotenv from "dotenv";

//dotenv.config({ quiet: true });

const SESSION_FILE = ".termauth-session";

export function saveSessionToken(token) {
    fs.writeFileSync(SESSION_FILE, token, "utf8");
}

export function readSessionToken() {
    try {
        return fs.readFileSync(SESSION_FILE, "utf8");
    } catch {
        return null;
    }
}

export function decodeSessionToken() {
    const token = readSessionToken();
    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

export function clearSessionToken() {
    if (fs.existsSync(SESSION_FILE)) {
        fs.unlinkSync(SESSION_FILE);
    }
}

export function getLoggedInUser() {
    return decodeSessionToken();
}

# 📦 TermAuth – Terminal-Native Authentication System

**TermAuth** is a fully-featured, professional-grade terminal-based authentication system designed for real-world user management and secure CLI operations.

Built entirely in **Node.js** with **PostgreSQL**, it mimics the robustness of web-based auth flows but in a **terminal-native UX**, making it ideal for system-level tools, internal developer platforms, and secure command-line applications.

---

## 🔐 Features

- **Role-Based Access Control (RBAC)**:
  - Supports `admin`, `user`, `pending`, `banned`
  - Role promotion, demotion, and banning built-in
- **JWT-Based Login** with `.termauth-session` tracking
- **Secure User Registration & Login**
  - OTP (One-Time Password) sent via real email (Gmail/SMTP)
  - Email/password validation with bcrypt
- **Password & Email Reset Flow**
  - Secure token-based reset + expiration tracking
- **QR Code Login**
  - Terminal-displayed QR code with 4-digit serial scan login
- **Admin Dashboard**
  - Promote, demote, change roles, ban/unban, list users, export database
- **User Dashboard**
  - View own info, update email, reset password, export personal data
- **International Language Support** (planned)
- **Persistent CLI session storage**
- **Beautiful CLI prompts** with `chalk`, `inquirer`, and `boxen`

---

## 🗂️ Folder Structure

```
src/
├── cli/             # All terminal interactions (register, login, dashboard, etc)
├── models/          # PostgreSQL models (user, otp, session)
├── utils/           # Email, QR, env, JWT, session helpers
├── middlewares/     # CLI-level role & auth enforcement
├── .termauth-session # Saved JWT session token
.env
```

---

## 📷 Screenshots

- QR Code login with 4-digit serial
- Terminal menus for each role
- OTP + email verification flows

---

## ✅ Why This Project?

TermAuth is designed for:
- 🔐 **Building CLI-native secure environments**
- 🧑‍💻 Developers needing robust terminal auth
- 📦 Systems needing secure credential login without a GUI
- 🚀 **Showcasing backend engineering** (RBAC, JWT, PostgreSQL, CLI UX)

---

## ⚙️ Tech Stack

- Node.js (ESM modules)
- PostgreSQL
- Nodemailer (Gmail)
- QR Code terminal rendering
- Inquirer, Chalk, Boxen
- Docker (optional)
- `dotenv`, `jsonwebtoken`, `bcrypt`

---

## 🚧 TODO

- 2FA via Email or App
- CLI Theming + Language selection
- Account deletion and audit logging
- Automatic role upgrades after verification
- Admin logs & analytics

---

## 📜 License

MIT License  
© 2025 Eddy Mouity

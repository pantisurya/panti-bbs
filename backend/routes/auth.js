import express from "express";
import { dataStore } from "../lib/dataStore.js";

const router = express.Router();

// Simple login endpoint for development/testing only
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ status: "error", message: "username and password required" });

    const users = await dataStore.getAll("user_default");
    const user = users.find((u) => u.username === username);

    // Check if user exists
    if (!user) {
      return res.status(401).json({ status: "error", message: "Invalid credentials", errorCode: "INVALID_USERNAME" });
    }

    // Check if password matches
    if (user.password !== password) {
      return res.status(401).json({ status: "error", message: "Password salah", errorCode: "INVALID_PASSWORD" });
    }

    // Check if user is active (status must be explicitly true)
    // If status is undefined, false, or "false", user is inactive
    if (user.status !== true && user.status !== "true") {
      return res.status(401).json({ status: "error", message: "Akun Anda nonaktif, hubungi administrator", errorCode: "INACTIVE_ACCOUNT" });
    }

    // Return simple token (not secure) and user data (without password)
    // Provide a consistent response shape expected by the frontend
    const { password: _pw, ...safeUser } = user;
    res.json({ status: "success", token: "dev-token", user: safeUser });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;

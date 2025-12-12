// backend/server.js
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const fs = require("fs");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });

// ===== MIDDLEWARE =====
app.use(cors()); // allow requests from frontend (development)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===== TEMP "DATABASE" FOR DEMO =====
// In real project, replace with MongoDB.
const users = [];

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("SmartHire backend is running");
});

// =====================================================
// 1) NEW: JSON REGISTER (used by register.html)
//     POST /api/auth/register
// =====================================================
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existing = users.find((u) => u.email === email);
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      phone: phone || "",
      password, // NOTE: plain text only for demo – hash this in real apps!
      role: role || "seeker",
    };

    users.push(newUser);
    console.log("Registered (JSON) user:", newUser);

    return res.status(201).json({
      message: "Registration successful",
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// =====================================================
// 2) NEW: LOGIN (used by login.html)
//     POST /api/auth/login
// =====================================================
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = users.find((u) => u.email === email);
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // For now, return a dummy token – later replace with JWT
    const token = "dummy-token-" + user.id;

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// =====================================================
// 3) EXISTING: /register WITH GEMINI ATS + RESUME UPLOAD
//     used by your old form with multipart/form-data
// =====================================================
app.post("/register", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, password } = req.body; // currently not stored
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({ error: "Resume file required" });
    }

    // Read uploaded resume file as text
    const resumeText = fs.readFileSync(resumeFile.path, "utf8");

    // Call Gemini API for ATS analysis
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this resume and give ATS score (0-100):\n\n${resumeText}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    // try to extract a number as ATS score
    const scoreMatch = output.match(/(\d{1,3})/);
    const atsScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

    // Remove temp file
    fs.unlinkSync(resumeFile.path);

    return res.json({
      message: `Registration successful for ${name}`,
      atsScore,
      atsAnalysis: output,
    });
  } catch (err) {
    console.error("Gemini /register error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ===== START SERVER =====
// ===== START SERVER =====
// Export for Vercel (serverless)
module.exports = app;

// Only listen if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`Backend running on http://localhost:${PORT}`)
  );
}

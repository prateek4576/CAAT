import express from "express";
import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const server = express();

// ===============================
// File / Directory Setup
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===============================
// Middleware
// ===============================
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// Serve all HTML, CSS, JS, images, etc.
// from the project folder
server.use(express.static(__dirname));

// ===============================
// MongoDB Setup
// ===============================
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

const client = new MongoClient(mongoURI);

let db;

// ===============================
// Connect to MongoDB
// ===============================
async function connectDB() {
  try {
    await client.connect();

    db = client.db("CAAT");

    console.log("MongoDB Connected ✅");

    // Start server only after DB connection
    const PORT = process.env.PORT || 3000;

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });

  } catch (err) {
    console.error("MongoDB Connection Error ❌");
    console.error(err);

    process.exit(1);
  }
}

// ===============================
// HTML Routes
// ===============================

server.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

server.get("/index.html", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

server.get("/quiz.html", (req, res) => {
  res.sendFile(join(__dirname, "quiz.html"));
});

server.get("/about.html", (req, res) => {
  res.sendFile(join(__dirname, "about.html"));
});

server.get("/contact.html", (req, res) => {
  res.sendFile(join(__dirname, "contact.html"));
});

server.get("/signup.html", (req, res) => {
  res.sendFile(join(__dirname, "signup.html"));
});

server.get("/login.html", (req, res) => {
  res.sendFile(join(__dirname, "login.html"));
});

server.get("/dashboard.html", (req, res) => {
  res.sendFile(join(__dirname, "dashboard.html"));
});

// ===============================
// SIGNUP
// ===============================

server.post("/signup-submit", async (req, res) => {
  try {
    const { name, email, password, ...otherData } = req.body;

    const collection = db.collection("users");

    // Check if user already exists
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      return res.send(`
        <script>
          alert("User already exists, try again with a different email.");
          window.location.href = "/signup.html";
        </script>
      `);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      attempted: 0,
      ...otherData
    };

    await collection.insertOne(newUser);

    res.send(`
      <script>
        localStorage.setItem("userEmail", ${JSON.stringify(email)});
        window.location.href = "/quiz.html";
      </script>
    `);

  } catch (err) {
    console.error("Signup Error ❌", err);

    res.status(500).send(`
      <script>
        alert("Error creating account. Please try again.");
        window.location.href = "/signup.html";
      </script>
    `);
  }
});

// ===============================
// SAVE QUIZ SCORE
// ===============================

server.post("/save-score", async (req, res) => {
  try {
    const {
      email,
      name,
      className,
      math,
      science,
      aptitude,
      total
    } = req.body;

    const collection = db.collection("users");

    const istTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    });

    const result = await collection.updateOne(
      { email: email },
      {
        $push: {
          scores: {
            math: math,
            science: science,
            aptitude: aptitude,
            total: total,
            date: istTime
          }
        },

        $inc: {
          attempted: 1
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send("User not found ❌");
    }

    res.send("Score saved successfully ✅");

  } catch (err) {
    console.error("Save Score Error ❌", err);

    res.status(500).send("Error saving score ❌");
  }
});

// ===============================
// LOGIN - CHECK USER
// ===============================

server.post("/check-user", async (req, res) => {
  try {
    const { email, password } = req.body;

    const collection = db.collection("users");

    const user = await collection.findOne({ email });

    // User doesn't exist
    if (!user) {
      return res.json({
        status: "no_user"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.json({
        status: "wrong_password"
      });
    }

    // Login successful
    res.json({
      status: "success",
      attempted: user.attempted || 0
    });

  } catch (err) {
    console.error("Login Error ❌", err);

    res.status(500).json({
      status: "error"
    });
  }
});

// ===============================
// GET USER
// ===============================

server.post("/get-user", async (req, res) => {
  try {
    const { email } = req.body;

    const collection = db.collection("users");

    const user = await collection.findOne({ email });

    if (user) {
      return res.json({
        email: user.email,
        name: user.name || "Not set",
        attempted: user.attempted || 0
      });
    }

    res.json({});

  } catch (err) {
    console.error("Get User Error ❌", err);

    res.status(500).json({});
  }
});

// ===============================
// CONTACT FORM
// ===============================

server.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Check email environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ EMAIL_USER or EMAIL_PASS is missing.");

      return res.status(500).json({
        success: false,
        message: "Email configuration missing."
      });
    }

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email details
    const mailOptions = {
      from: process.env.EMAIL_USER,
      replyTo: email,
      to: "7prateekj45@gmail.com",
      subject: "New Contact Form Message",

      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Message sent successfully ✅"
    });

  } catch (err) {
    console.error("Contact Email Error ❌", err);

    res.status(500).json({
      success: false,
      message: "Error sending message ❌"
    });
  }
});

// ===============================
// 404 HANDLER
// ===============================

server.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// ===============================
// Start Application
// ===============================

connectDB();
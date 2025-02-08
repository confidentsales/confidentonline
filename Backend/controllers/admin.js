const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const path = require("path");
const multer = require("multer");
const dotenv = require("dotenv");
const router = express.Router();
const authenticateToken = require("../middleware/auth"); // Import the auth middleware
dotenv.config();

router.use(cors());
router.use(bodyParser.json());
router.use(express.json());

//admin register
async function adminRegister(req, res) {
  const { username, password, email } = req.body;
  try {
    const userExist = await pool.query(
      "SELECT * FROM admins WHERE username =$1",
      [username]
    );
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "username already exist" });
    }
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      "INSERT INTO admins (username,password,email) VALUES ($1,$2,$3)",
      [username, hashedPassword, email]
    );
    res.status(201).send("admin user created ");
  } catch (error) {
    console.error("error creting admin user", error);
    res.status(500).json("error occured");
  }
}

// Google reCAPTCHA configuration
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

const activeTokens = {};

async function adminLogin(req, res) {
  const { email, password, recaptchaToken } = req.body;

  try {
    // Verify reCAPTCHA
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {

        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ error: "Invalid reCAPTCHA" });
    }

    // Check if user exists
    const result = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, userEmail: user.email, role: "admin" },
      process.env.SECRET,
      {
        
      }
    );

    activeTokens[token] = { id: user.id,userEmail: user.email, role: 'admin' };
    res.json({  id: user.id,token, userEmail: user.email,username: user.username, role: "admin" });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function userLogin(req, res) {
  const { email, password, recaptchaToken } = req.body;

  try {
    // Verify reCAPTCHA
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ error: "Invalid reCAPTCHA" });
    }

    // Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: "user" },
      process.env.SECRET,
      {
        
      }
    );

    // Store the active token
    activeTokens[token] = { id: user.id,email: user.email, role: "user" };

    res.json({id:user.id, token, email: user.email, role: "user" });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}



module.exports = {
  adminRegister,
  adminLogin,
  userLogin,
};

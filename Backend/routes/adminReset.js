const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const router = express.Router();
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const {
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/adminReset");

router.use(cors());
router.use(bodyParser.json());
router.use(express.json());

router
  
  .route("/forgot-password")
  .post(forgotPassword);

router
  
  .route("/verify-otp")
  .post(verifyOtp);

router
  // Route to reset the password
  .route("/reset-password")
  .post(resetPassword);

module.exports = router;

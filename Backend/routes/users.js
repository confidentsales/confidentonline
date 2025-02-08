const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
config.dotenv();

router.use(cors());
router.use(bodyParser());
router.use(express.json());

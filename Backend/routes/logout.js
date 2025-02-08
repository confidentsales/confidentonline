const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const app = express();
require("dotenv").config();

const { handleLogoutUsers } = require("../controllers/logout");

app.use(bodyParser.json());
app.use(express.json());


let invalidatedTokens = [];
const authMiddleware = (req, res, next) => {
    const token = req.header("x-auth-token");
  
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
  
    try {
      const decoded = jwt.verify(token, "secret");
      req.user = decoded;
  
      // Check if the token is in the blacklist
      if (invalidatedTokens.includes(token)) {
        return res.status(401).json({ message: "Token invalidated" });
      }
  
      next();
    } catch (err) {
      res.status(401).json({ message: "Token is not valid" });
    }
  };


router.route("/").post(handleLogoutUsers);

module.exports = router;

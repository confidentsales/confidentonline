const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const app = express();
require("dotenv").config();


app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("uploads"));


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
  

async function handleLogoutUsers(req,res){
    const token = req.header("x-auth-token");
  
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }
  
    invalidatedTokens.push(token);
  
    res.json({ message: "Logged out successfully" });
}

module.exports={
    handleLogoutUsers
}
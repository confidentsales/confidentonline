const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const xlsx = require("xlsx");
const path = require("path");
const multer = require("multer");
const app = express();
const fs = require("fs");
const { format } = require("date-fns");
const status = require("express-status-monitor");
require("dotenv").config();

const userapp = require("./routes/contacts");
const importExcelapp = require("./routes/excel");
const adminLogin = require("./routes/admin");
const backupRoutes = require("./routes/backup");
const testRoutes = require("./routes/test");
const adminReset = require("./routes/adminReset");
const userReset = require("./routes/userReset");
const dropDown = require("./routes/dropdown");
const portalUser = require("./routes/handleUsers");
const logoutuser = require("./routes/logout");
const salesData = require("./routes/salesdata");
const salesImport = require("./routes/salesImport");



// app.use(cors());
app.use(
  cors({
    origin: process.env.ORIGIN_URL, // Allow this origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
    credentials: true, // Enable credentials (if needed)
  })
);

app.options("*", cors());

app.use("/api/contacts", userapp); 
app.use("/api/admin", adminLogin);
app.use("/api/import", importExcelapp);
app.use("/api/backup", backupRoutes);
app.use("/api/test", testRoutes);
app.use("/api/adminReset", adminReset);
app.use("/api/userReset", userReset);
app.use("/api/dropdown", dropDown);
app.use("/api/users", portalUser);
app.use("/api/logout", logoutuser);
app.use("/api/sales", salesData);
app.use("/api/sales-import", salesImport);



app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("uploads"));

app.use(status());

app.get("/", (req, res) => {
  res.send("server started successfully");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

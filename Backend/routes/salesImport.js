const express = require("express");
const router = express.Router();
const ExcelJs = require("exceljs");
const multer = require("multer");
const pool = require("../db");
const bodyParser = require("body-parser");
const cors = require("cors");
const xlsx = require("xlsx");
const fs = require("fs");
const { handleImport,getAllLogs } = require("../controllers/salesimport");

router.use(express.json());
router.use(cors());
router.use(bodyParser.json());

const upload = multer({ storage: multer.memoryStorage() });

router.route("/").post(upload.single("file"), handleImport);

router.route("/logs").get(getAllLogs);

module.exports = router;

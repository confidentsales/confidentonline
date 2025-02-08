const express = require("express");
const pool = require("../db");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const ExcelJS = require("exceljs");
const router = express.Router();
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

router.use(bodyParser.json());
router.use(express.json());
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for uploaded files

function formatDate(date) {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.warn(`Invalid date value: ${date}`);
    return null;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getUsernameByEmail(email) {
  try {
    // Check in admins table
    const adminResult = await pool.query(
      "SELECT username FROM admins WHERE email = $1",
      [email]
    );

    if (adminResult.rows.length > 0) {
      return adminResult.rows[0].username;
    }

    // Check in users table if not found in admins
    const userResult = await pool.query(
      "SELECT username FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length > 0) {
      return userResult.rows[0].username;
    }

    // If not found in both, default to "Admin"
    return "Admin";
  } catch (error) {
    console.error("Error fetching username:", error);
    return "Admin";
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_USER, 
    pass: process.env.AUTH_PASS, 
  },
});

async function sendImportSummaryEmail(
  fromEmail,
  toEmail,
  userName,
  fileName,
  updatedCount,
  insertedCount
) {
  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: "Import Summary - Contacts Data",
    html: `
      <p>Hello Admin,</p>
      <p>The import process has been completed successfully.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li><strong>Imported by:</strong> ${userName}</li>
        <li><strong>File Name:</strong> ${fileName}</li>
        <li><strong>Total Records Processed:</strong> ${
          updatedCount + insertedCount
        }</li>
        <li><strong>Records Updated:</strong> ${updatedCount}</li>
        <li><strong>Records Inserted:</strong> ${insertedCount}</li>
      </ul>
      <p>Regards,<br>Your System</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Import summary email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

const columnMapping = {
  name: "Name",
  customer_unique_code: "Customer Unique Code",
  clinic_college_name: "Clinic/College/Company Name",
  designation: "Designation",
  department: "Department",
  address: "Address",
  mobileno: "MobileNo",
  whatsapp_availability: "Whatsapp Availability",
  alternative_mobile_no: "Alternative Mobile Number",
  alternative_mobile_no2: "Alternative Mobile Number 2",
  alternative_mobile_no3: "Alternative Mobile Number 3",
  telephone: "Telephone",
  drug_license_no: "Drug License No",
  gst: "GST #",
  email_id: "E-mail Id",
  website: "Website",
  city: "City",
  state: "State",
  country: "Country",
  district: "District",
  pincode: "Pincode",
  type: "Type",
  source: "Source",
  status: "Status(Active/Inactive)",
  enquiry: "Enquiry",
  last_purchased_date: "Last Purchased Date",
  branch_data: "Branch Data",
  under_sales_person: "Under Sales person",
  create_date: "Create Date",
  age: "Age of Data",
  tags: "Tags",
  last_updated_date: "Last Updated Date",
};

let isImportInProgress = false;

async function handleImportExcel(req, res) {
  if (isImportInProgress) {
    return res.status(400).json({
      message: "Another import operation is in progress. Please wait.",
    });
  }

  isImportInProgress = true;

  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const selectedColumns = req.body.selectedColumns
      ? JSON.parse(req.body.selectedColumns)
      : [];

    if (!Array.isArray(selectedColumns) || selectedColumns.length === 0) {
      return res.status(400).send("Selected columns are required");
    }

    const validSelectedColumns = selectedColumns.filter((col) =>
      columnMapping.hasOwnProperty(col)
    );

    if (validSelectedColumns.length === 0) {
      return res.status(400).send("No valid columns selected");
    }

    const username = await getUsernameByEmail(req.body.email);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1);
    const excelHeaders = worksheet.getRow(1).values.slice(1);

    const worksheetCount = workbook.worksheets.length;
    if (worksheetCount !== 1) {
      return res.status(400).json({
        message: "The Excel file must contain only one sheet or workbook.",
      });
    }

    const invalidHeaders = excelHeaders.filter(
      (header) => !Object.values(columnMapping).includes(header)
    );

    if (invalidHeaders.length > 0) {
      return res.status(400).json({
        message: "Invalid headers found in the uploaded file.",
        invalidHeaders,
      });
    }

    const mobileNumbers = new Set();
    const totalRows = worksheet.rowCount - 1;
    const batchSize = 1000;
    let updated_count = 0;
    let inserted_count = 0;

    await pool.query("BEGIN");

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData = {};

      validSelectedColumns.forEach((dbColumn) => {
        const excelHeader = columnMapping[dbColumn];
        const colIndex = excelHeaders.indexOf(excelHeader) + 1;
        if (colIndex > 0) {
          rowData[dbColumn] = row.getCell(colIndex).value;
        }
      });

      if (!rowData.mobileno) continue;

      if (mobileNumbers.has(rowData.mobileno)) {
        return res.status(400).json({
          message: "Duplicate mobile numbers found in the uploaded file.",
          duplicates: [rowData.mobileno],
        });
      }

      mobileNumbers.add(rowData.mobileno);
      rowData.create_date = formatDate(rowData.create_date);
      rowData.last_updated_date = formatDate(new Date());
      rowData.last_purchased_date = formatDate(rowData.last_purchased_date);

      const result = await pool.query(
        'SELECT * FROM "contacts" WHERE mobileno = $1',
        [rowData.mobileno]
      );

      if (result.rows.length > 0) {
        const updateColumns = validSelectedColumns.filter(
          (col) => col !== "last_updated_date"
        );
        await pool.query(
          `UPDATE "contacts" SET ${updateColumns
            .map((col, i) => `"${col}" = $${i + 1}`)
            .join(", ")}, "last_updated_date" = $${
            updateColumns.length + 1
          } WHERE mobileno = $${updateColumns.length + 2}`,
          [
            ...updateColumns.map((col) => rowData[col]),
            new Date(),
            rowData.mobileno,
          ]
        );
        updated_count++;
      } else {
        await pool.query(
          `INSERT INTO "contacts" (${validSelectedColumns
            .map((col) => `"${col}"`)
            .join(", ")}, "last_updated_date")
           VALUES (${validSelectedColumns
             .map((_, i) => `$${i + 1}`)
             .join(", ")}, $${validSelectedColumns.length + 1})`,
          [
            ...validSelectedColumns.map((col) => rowData[col]),
            rowData.last_updated_date,
          ]
        );
        inserted_count++;
      }

      if ((updated_count + inserted_count) % batchSize === 0) {
        await pool.query("COMMIT");
        await pool.query("BEGIN");
      }
    }

    await pool.query("COMMIT");

    if (updated_count > 0 || inserted_count > 0) {
      await pool.query(
        "INSERT INTO logs (username, file_name, record_count, operation_type, updated_count, inserted_count) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          username,
          req.file.originalname,
          updated_count + inserted_count,
          "IMPORT",
          updated_count,
          inserted_count,
        ]
      );
    }
    await sendImportSummaryEmail(
      req.body.email, 
      process.env.EMAIL, 
      username,
      req.file.originalname,
      updated_count,
      inserted_count
    );
    res.status(200).json({
      message: "Import completed successfully",
      updated_count,
      inserted_count,
    });
  } catch (e) {
    await pool.query("ROLLBACK");
    console.error("Error importing contacts:", e);
    res
      .status(500)
      .json({
        message: "An error occurred while importing data",
        error: e.message,
      });
  } finally {
    isImportInProgress = false;
  }
}

//to get all logs
async function getAllLogs(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM logs ORDER BY timestamp DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching logs :", error);
    res.status(500).send("an error occurred while fetching the logs");
  }
}

module.exports = {
  handleImportExcel,
  getAllLogs,
};

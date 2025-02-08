const express = require("express");
const router = express.Router();
const multer = require("multer");
const pool = require("../db");
const bodyParser = require("body-parser");
const cors = require("cors");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

router.use(express.json());
router.use(cors());
router.use(bodyParser.json());

// Multer configuration for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Mapping of database columns to Excel headers
const columnMapping = {
  sl_no: "Sl No",
  year: "Year",
  sales_person: "Sales Person",
  voucher_number: "Voucher Number",
  reference: "Reference",
  date: "Date",
  month: "Month",
  voucher_type: "Voucher Type",
  party_name: "Party Name",
  party_state: "Party State",
  district: "District",
  party_alias: "Party Alias",
  party_ledger_parent: "Party Ledger Parent",
  gst_number: "GST NUMBER",
  item_name: "Item Name",
  item_alias: "Item Alias",
  item_hsncode: "Item HSNCODE",
  item_part_no: "Item Part No",
  brand: "Brand (Item Group)",
  item_confident_group: "Item Confident Group",
  godown: "Godown",
  item_batch: "Item Batch",
  actual_quantity: "Acutal Quantity",
  billed_quantity: "Billed Quantity",
  alternate_actual_quantity: "Alternate Actual Quantity",
  alternate_billed_quantity: "Alternate Billed Quantity",
  rate: "Rate",
  unit: "Unit",
  discount: "Discount",
  discount_amount: "Discount Amount",
  amount: "Amount",
  sales_ledger: "Sales Ledger",
  narration: "Narration",
  offer_type: "Offer Type",
  last_updated_date: "Last Updated Date",
  mobileno: "Mobile No",
};

const transporter = nodemailer.createTransport({
  service: "gmail", // or any email provider like Outlook, etc.
  auth: {
    user: process.env.AUTH_USER,
    pass: process.env.AUTH_PASS,
  },
});

async function sendEmailLogToAdmin(
  senderEmail,
  username,
  fileName,
  recordCount,
  insertedCount,
  updatedCount
) {
  try {
    // Prepare email options
    const mailOptions = {
      from: senderEmail,
      to: process.env.EMAIL,
      subject: "Import Summary - Sales Data",
      text: `The import operation has been completed successfully.

Details:
- Username: ${username}
- File Name: ${fileName}
- Total Records: ${recordCount}
- Inserted Records: ${insertedCount}
- Updated Count : ${updatedCount}
- Operation Type: Import
- Timestamp: ${formatTimestamp(new Date())}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent to admin successfully.");
  } catch (error) {
    console.error("Error sending email to admin:", error);
  }
}

// Flag to manage concurrent imports
let isImportInProgress = false;

function formatTimestamp(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

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

// Function to handle Excel import
async function handleImport(req, res) {
  if (isImportInProgress) {
    return res.status(400).json({
      message: "Another import operation is in progress. Please wait.",
    });
  }

  isImportInProgress = true;

  try {
    // Check if file is uploaded
    if (!req.file) {
      isImportInProgress = false;
      return res.status(400).json({ message: "No file uploaded." });
    }

    const username = await getUsernameByEmail(req.body.email);
    // Read Excel file from buffer
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    // Access the first sheet (adjust as needed)
    const worksheet = workbook.worksheets[0];

    // Get headers from the first row
    const excelHeaders = worksheet.getRow(1).values.slice(1);

    // Validate headers
    const invalidHeaders = excelHeaders.filter(
      (header) => !Object.values(columnMapping).includes(header)
    );

    if (invalidHeaders.length > 0) {
      isImportInProgress = false;
      return res.status(400).json({
        message: "Invalid headers found in the uploaded file.",
        invalidHeaders,
      });
    }

    // Convert worksheet data to JSON
    const jsonData = [];
    const recordCount = jsonData.length;
    let insertedCount = 0;
    const updatedCount = 0;
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) return; // Skip the header row
      const rowData = {};
      row.eachCell((cell, colIndex) => {
        const header = excelHeaders[colIndex - 1];
        const mappedColumn = Object.keys(columnMapping).find(
          (key) => columnMapping[key] === header
        );
        if (mappedColumn) {
          rowData[mappedColumn] = cell.value || null;
        }
      });
      jsonData.push(rowData);
    });

    // Insert data into the database
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Check for duplicate sl_no values in the database
      const slNos = jsonData.map((row) => row.sl_no);
      const existingSlNoQuery = `
         SELECT sl_no 
         FROM sales 
         WHERE sl_no = ANY($1::int[])
       `;
      const existingSlNoResult = await client.query(existingSlNoQuery, [slNos]);
      const existingSlNos = existingSlNoResult.rows.map((row) => row.sl_no);

      if (existingSlNos.length > 0) {
        await client.query("ROLLBACK");
        isImportInProgress = false;
        return res.status(400).json({
          message: "Some records with same sl_no were found.",
          duplicateSlNos: existingSlNos,
        });
      }

      let insertedCount = 0;
      for (const row of jsonData) {
        const formattedDate = formatDate(row.date);
        const formattedLastUpdateDate = Date.now(row.last_updated_date);
        const query = `
  INSERT INTO sales (
    sl_no, year, sales_person, voucher_number, reference, date, month, voucher_type, party_name, 
    party_state, district, party_alias, party_ledger_parent, gst_number, 
    item_name, item_alias, item_hsncode, item_part_no, brand, 
    item_confident_group, godown, item_batch, actual_quantity, 
    billed_quantity, alternate_actual_quantity, alternate_billed_quantity, 
    rate, unit, discount, discount_amount, amount, sales_ledger, 
    narration, offer_type, last_updated_date, mobileno
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
    $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, 
    $29, $30, $31, $32, $33,$34, NOW(), $35
  )
  ON CONFLICT (sl_no) DO UPDATE
  SET
    year = EXCLUDED.year,
    sales_person = EXCLUDED.sales_person,
    voucher_number = EXCLUDED.voucher_number,
    reference = EXCLUDED.reference,
    date = EXCLUDED.date,
    month = EXCLUDED.month,
    voucher_type = EXCLUDED.voucher_type,
    party_name = EXCLUDED.party_name,
    party_state = EXCLUDED.party_state,
    district = EXCLUDED.district,
    party_alias = EXCLUDED.party_alias,
    party_ledger_parent = EXCLUDED.party_ledger_parent,
    gst_number = EXCLUDED.gst_number,
    item_name = EXCLUDED.item_name,
    item_alias = EXCLUDED.item_alias,
    item_hsncode = EXCLUDED.item_hsncode,
    item_part_no = EXCLUDED.item_part_no,
    brand = EXCLUDED.brand,
    item_confident_group = EXCLUDED.item_confident_group,
    godown = EXCLUDED.godown,
    item_batch = EXCLUDED.item_batch,
    actual_quantity = EXCLUDED.actual_quantity,
    billed_quantity = EXCLUDED.billed_quantity,
    alternate_actual_quantity = EXCLUDED.alternate_actual_quantity,
    alternate_billed_quantity = EXCLUDED.alternate_billed_quantity,
    rate = EXCLUDED.rate,
    unit = EXCLUDED.unit,
    discount = EXCLUDED.discount,
    discount_amount = EXCLUDED.discount_amount,
    amount = EXCLUDED.amount,
    sales_ledger = EXCLUDED.sales_ledger,
    narration = EXCLUDED.narration,
    offer_type = EXCLUDED.offer_type,
    last_updated_date = NOW(),
    mobileno = EXCLUDED.mobileno;
`;

        const values = [
          row.sl_no,
          row.year,
          row.sales_person,
          row.voucher_number,
          row.reference,
          formattedDate,
          row.month,
          row.voucher_type,
          row.party_name,
          row.party_state,
          row.district,
          row.party_alias,
          row.party_ledger_parent,
          row.gst_number,
          row.item_name,
          row.item_alias,
          row.item_hsncode,
          row.item_part_no,
          row.brand,
          row.item_confident_group,
          row.godown,
          row.item_batch,
          row.actual_quantity,
          row.billed_quantity,
          row.alternate_actual_quantity,
          row.alternate_billed_quantity,
          row.rate,
          row.unit,
          row.discount,
          row.discount_amount,
          row.amount,
          row.sales_ledger,
          row.narration,
          row.offer_type,
          row.mobileno,
        ];
        const result = await client.query(query, values);
        await client.query(query, values);
        if (result.rowCount > 0) {
          if (result.command === "UPDATE") {
            updatedCount++; // Increment updated count if the record was updated
          } else {
            insertedCount++;
          }
        }
      }

      await client.query("COMMIT");

      // Log operation details
      const logQuery = `
       INSERT INTO sales_logs (username, file_name, record_count, operation_type, inserted_count,updated_count) 
       VALUES ($1, $2, $3, $4, $5,$6)
     `;
      const logValues = [
        username,
        req.file.originalname,
        insertedCount+updatedCount,
        "import",
        insertedCount,
        updatedCount,
      ];
      await client.query(logQuery, logValues);
      await sendEmailLogToAdmin(
        req.body.email,
        username,
        req.file.originalname,
        insertedCount+updatedCount,
        insertedCount,
        updatedCount
      );

      res.status(200).json({ message: "Data imported successfully." });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error during transaction:", error.message);
      res
        .status(500)
        .json({ message: "Error importing data.", error: error.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error reading Excel file:", error.message);
    res
      .status(500)
      .json({ message: "Error processing file.", error: error.message });
  } finally {
    isImportInProgress = false;
  }
}

async function getAllLogs(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM sales_logs ORDER BY timestamp DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching logs :", error);
    res.status(500).send("an error occurred while fetching the logs");
  }
}

module.exports = { handleImport, getAllLogs };

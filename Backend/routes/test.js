const path = require("path");
const fs = require("fs");
const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");
const multer = require("multer");
const cors = require("cors");
const pool = require("../db");
const moment = require("moment");
const cloudinary = require("cloudinary").v2;

router.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

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

router.post("/analyze", upload.single("file"), async (req, res) => {
  const results = [];
  let duplicateCount = 0;
  let genuineCount = 0;

  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer); // Load the file from memory
    const worksheet = workbook.getWorksheet(1);
    const excelHeaders = worksheet.getRow(1).values.slice(1);

    const mobileNumbers = new Set();

    // Check for header mismatches
    const invalidHeaders = excelHeaders.filter(
      (header) => !Object.values(columnMapping).includes(header)
    );

    if (invalidHeaders.length > 0) {
      return res.status(400).json({
        message: "Invalid headers found in the uploaded file.",
        invalidHeaders,
      });
    }

    let duplicateCount = 0;
    let genuineCount = 0;


    for (let rowNumber = 2; rowNumber <= 25001; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData = {};

      Object.keys(columnMapping).forEach((dbColumn) => {
        const excelHeader = columnMapping[dbColumn];
        const colIndex = excelHeaders.indexOf(excelHeader) + 1;
        if (colIndex > 0) {
          rowData[dbColumn] = row.getCell(colIndex).value;
        }
      });

      const mobileNo = rowData.mobileno
        ? String(rowData.mobileno).trim()
        : null;
      if (!mobileNo) continue; // Skip if MobileNo is not provided

      if (mobileNumbers.has(mobileNo)) {
        duplicateCount++;
        results.push({ MobileNo: mobileNo, Genuine: false });
        break; // Skip further checks for duplicates
      }

      mobileNumbers.add(mobileNo);
      const result = await pool.query(
        'SELECT * FROM "contacts" WHERE "mobileno" = $1',
        [mobileNo]
      );

      const comparisonResults = { MobileNo: mobileNo, Genuine: true }; // Assume genuine initially

      if (result.rows.length > 0) {
        duplicateCount++;
        comparisonResults.Genuine = false; // Mark as duplicate
        const dbData = result.rows[0];

        // Compare each field
        Object.keys(columnMapping).forEach((dbColumn) => {
          const excelValue = rowData[dbColumn];
          const dbValue = dbData[dbColumn];

          // Store both values in separate fields
          if (excelValue) {
            comparisonResults[`${columnMapping[dbColumn]} (Excel)`] =
              excelValue;
          }
          if (dbValue !== null) {
            comparisonResults[`${columnMapping[dbColumn]} (DB)`] = dbValue;
          }
        });
      } else {
        genuineCount++;
        // Add values if genuine, comparing each field similarly
        Object.keys(columnMapping).forEach((dbColumn) => {
          const excelValue = rowData[dbColumn];
          if (excelValue) {
            comparisonResults[`${columnMapping[dbColumn]} (Excel)`] =
              excelValue;
          }
        });
      }

      results.push(comparisonResults);
    }

    // Now generate the Excel file and save it
    const resultWorkbook = new ExcelJS.Workbook();
    const resultWorksheet = resultWorkbook.addWorksheet("Results");

    const headers = [
      "MobileNo",
      "Genuine",
      ...Object.values(columnMapping).flatMap((col) => [
        `${col} (Excel)`,
        `${col} (DB)`,
      ]),
    ];

    resultWorksheet.columns = headers.map((header) => ({
      header,
      key: header,
    }));

    results.forEach((result) => {
      resultWorksheet.addRow(result);
    });

    // Save the file to Cloudinary (or you can save locally)
    const filePath = path.join("/tmp", `results_${Date.now()}.xlsx`);
    await resultWorkbook.xlsx.writeFile(filePath);

    // Upload to Cloudinary (update with your correct cloud name)
    const cloudinaryUploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "Uploads",
        public_id: `results_${Date.now()}`,
        format: "xlsx",
      },
      (error, cloudinaryResult) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          return res
            .status(500)
            .json({ message: "Failed to upload to Cloudinary" });
        }

        // Return the download URL if upload is successful
        res.json({
          results,
          duplicateCount,
          genuineCount,
          message: "File processed successfully, here are the results.",
          downloadUrl: cloudinaryResult.secure_url,
        });

        // Schedule file deletion after 1 minute (60000 milliseconds)
        setTimeout(async () => {
          try {
            await cloudinary.uploader.destroy(cloudinaryResult.public_id, {
              resource_type: "raw",
            });
            console.log(
              `File ${cloudinaryResult.public_id} deleted from Cloudinary`
            );
          } catch (deleteError) {
            console.error("Error deleting file from Cloudinary:", deleteError);
          }
        }, 60000); // 1 minute
      }
    );

    await pool.query(
      "INSERT INTO testlogs (username,file_name, genuine_count,duplicate_count) VALUES ($1, $2, $3, $4)",
      [
        req.body.username || "Admin",
        req.file.originalname,
        genuineCount,
        duplicateCount,
      ]
    );

    // Pipe the workbook stream to Cloudinary
    await resultWorkbook.xlsx.write(cloudinaryUploadStream);
  } catch (error) {
    console.error("Error occurred while processing the file", error);
    res.status(500).json({
      message: "An error occurred while processing the file",
      error: error.message || "File format is not correct",
    });
  }
});


router.get('/testlogs',async(req,res)=>{
  try {
    const result = await pool.query(
      "SELECT * FROM testlogs ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching logs :", error);
    res.status(500).send("an error occurred while fetching the logs");
  }
});


// Serve the file for download (if saving locally, you can return this part)
router.get("/download/:file", (req, res) => {
  const filePath = path.join("/tmp", req.params.file);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("File not found.");
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.params.file}`
    );
    res.download(filePath, (err) => {
      if (err) {
        return res.status(500).send("Error downloading the file.");
      }
    });
  });
});

module.exports = router;

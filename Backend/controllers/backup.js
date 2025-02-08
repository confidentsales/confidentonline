const express = require("express");
const router = express.Router();
const pool = require("../db");
const cors = require("cors");
const fs = require("fs");
const XLSX = require("xlsx");
const path = require("path");
const { Parser } = require("json2csv");
const csv = require("csv-parser");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");

router.use(express.json());
router.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const parseArrayField = (field) => {
  if (!field) return [];
  const cleaned = field.replace(/^\[|\]$/g, "").trim();
  return cleaned
    ? cleaned
        .split(",")
        .map((item) => item.trim().replace(/^"|"$/g, ""))
        .filter((item) => item && item !== '""')
    : [];
};

const formatDateToDDMMYYYY = (date) => {
  if (!date) return null;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.warn(`Invalid date value: ${date}`);
    return null;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};



async function handleBackupAllData(req, res) {
  const { fileName } = req.body;
  if (!fileName)
    return res.status(400).json({ message: "No new data to backup" });

  try {
    const contacts = (await pool.query("SELECT * FROM contacts")).rows;
    if (!contacts.length) return res.status(404).send("No data to backup");

    const formattedBackupDate = formatDateToDDMMYYYY(new Date());

    const existingBackupMobilenos = new Set(
      (await pool.query("SELECT mobileno FROM contacts_backup")).rows.map(
        (row) => row.mobileno
      )
    );

    const json2csvParser = new Parser({
      fields: [
        "name",
        "customer_unique_code",
        "clinic_college_name",
        "designation",
        "department",
        "address",
        "mobileno",
        "whatsapp_availability",
        "alternative_mobile_no",
        "alternative_mobile_no2",
        "alternative_mobile_no3",
        "telephone",
        "drug_license_no",
        "gst",
        "email_id",
        "website",
        "city",
        "state",
        "country",
        "district",
        "pincode",
        "type",
        "source",
        "status",
        "enquiry",
        "last_purchased_date",
        "branch_data",
        "under_sales_person",
        "create_date",
        "age",
        "tags",
        "last_updated_date",
        "backup_date",
      ],
      header: true,
    });

    const filteredContacts = contacts.filter(
      (contact) => !existingBackupMobilenos.has(contact.mobileno)
    );

    if (!filteredContacts.length) {
      return res.status(200).send("No new data to backup");
    }

    // Prepare CSV data
    const csvData = json2csvParser.parse(
      filteredContacts.map((contact) => ({
        ...contact,
        last_purchased_date: contact.last_purchased_date
        ? formatDateToDDMMYYYY(new Date(contact.last_purchased_date))
        : null,
      create_date: contact.create_date
        ? formatDateToDDMMYYYY(new Date(contact.create_date))
        : null,
      last_updated_date: contact.last_updated_date
        ? formatDateToDDMMYYYY(new Date(contact.last_updated_date))
        : null,
        backup_date: formattedBackupDate,
      }))
    );

    // Upload CSV data to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      `data:text/csv;base64,${Buffer.from(csvData).toString("base64")}`,
      {
        resource_type: "raw", // Required for non-image file uploads
        public_id: `backups/${fileName}_${formattedBackupDate}`, // Customize path as needed
        format: "csv",
      }
    );

    const backupQuery = `
      INSERT INTO contacts_backup (
        mobileno, name, customer_unique_code, clinic_college_name, designation, department, address,
        whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3, telephone,
        drug_license_no, gst, email_id, website, city, state, country, district, pincode, type, source, status,
        enquiry, last_purchased_date, branch_data, under_sales_person, create_date, age, tags, last_updated_date, backup_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
        $24, $25, $26, $27, $28, $29, $30, $31, $32, $33
      )`;

    for (const contact of filteredContacts) {
      await pool.query(backupQuery, [
        contact.mobileno,
        contact.name,
        contact.customer_unique_code,
        contact.clinic_college_name,
        contact.designation,
        contact.department,
        contact.address,
        contact.whatsapp_availability,
        contact.alternative_mobile_no,
        contact.alternative_mobile_no2,
        contact.alternative_mobile_no3,
        contact.telephone,
        contact.drug_license_no,
        contact.gst,
        contact.email_id,
        contact.website,
        contact.city,
        contact.state,
        contact.country,
        contact.district,
        contact.pincode,
        contact.type,
        contact.source,
        contact.status,
        contact.enquiry,
        contact.last_purchased_date
        ? formatDateToDDMMYYYY(new Date(contact.last_purchased_date))
        : null,
      contact.branch_data,
      contact.under_sales_person,
      contact.create_date
        ? formatDateToDDMMYYYY(new Date(contact.create_date))
        : null,
      contact.age,
      contact.tags,
      contact.last_updated_date
        ? formatDateToDDMMYYYY(new Date(contact.last_updated_date))
        : null,
        formattedBackupDate,
      ]);
    }

    res.status(200).json({
      fileUrl: uploadResponse.secure_url,
      backupDate: formattedBackupDate,
    });
  } catch (error) {
    console.error("Error backing up data:", error);
    res.status(500).send("Error backing up data");
  }
}

async function handleRestoreAllData(req, res) {
  const { fileName } = req.params;
  if (!fileName) return res.status(400).send("File name is required");

  const decodedFileName = decodeURIComponent(fileName);
  const cloudinaryUrl = `http://res.cloudinary.com/dgwe30jly/raw/upload/v1732354698/backups/${decodedFileName}`;
  const publicId = `backups/${decodedFileName}`;

  try {
    const existingBackupMobilenos = new Set(
      (await pool.query("SELECT mobileno FROM contacts_backup")).rows.map(
        (row) => row.mobileno
      )
    );

    const contactsToRestore = [];

    // Fetch the CSV from Cloudinary and parse it
    const response = await axios.get(cloudinaryUrl, { responseType: "stream" });
    const stream = response.data;

    stream
      .pipe(csv())
      .on("data", (row) => {
        if (existingBackupMobilenos.has(row.mobileno)) {
          row.whatsapp_availability = row.whatsapp_availability === "true";
          row.alternative_mobile_no = row.alternative_mobile_no
            ? parseInt(row.alternative_mobile_no, 10)
            : null;
          row.alternative_mobile_no2 = row.alternative_mobile_no2
            ? parseInt(row.alternative_mobile_no2, 10)
            : null;
          row.alternative_mobile_no3 = row.alternative_mobile_no3
            ? parseInt(row.alternative_mobile_no3, 10)
            : null;
          row.age = row.age ? parseInt(row.age, 10) : null;
          row.create_date = row.create_date
            ? new Date(row.create_date).toISOString()
            : null;
          row.last_purchased_date = row.last_purchased_date
            ? new Date(row.last_purchased_date).toISOString()
            : null;
          row.last_updated_date = row.last_updated_date
            ? new Date(row.last_updated_date).toISOString()
            : null;
          row.enquiry = parseArrayField(row.enquiry);
          row.tags = parseArrayField(row.tags);

          contactsToRestore.push(row);
        }
      })
      .on("end", async () => {
        if (!contactsToRestore.length) {
          return res.status(404).send("No matching records found for restore");
        }

        const upsertQuery = `
          INSERT INTO contacts (name, customer_unique_code, clinic_college_name, designation, department, address, mobileno,
            whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3, telephone,
            drug_license_no, gst, email_id, website, city, state, country, district, pincode, type, source, status,
            enquiry, last_purchased_date, branch_data, under_sales_person, create_date, age, tags, last_updated_date)
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
            $24, $25, $26, $27, $28, $29, $30, $31, $32
          )
          ON CONFLICT (mobileno)
          DO UPDATE SET
            name = EXCLUDED.name, customer_unique_code = EXCLUDED.customer_unique_code, clinic_college_name = EXCLUDED.clinic_college_name,
            designation = EXCLUDED.designation, department = EXCLUDED.department, address = EXCLUDED.address,
            whatsapp_availability = EXCLUDED.whatsapp_availability, alternative_mobile_no = EXCLUDED.alternative_mobile_no,
            alternative_mobile_no2 = EXCLUDED.alternative_mobile_no2, alternative_mobile_no3 = EXCLUDED.alternative_mobile_no3,
            telephone = EXCLUDED.telephone, drug_license_no = EXCLUDED.drug_license_no, gst = EXCLUDED.gst,
            email_id = EXCLUDED.email_id, website = EXCLUDED.website, city = EXCLUDED.city, state = EXCLUDED.state,
            country = EXCLUDED.country, district = EXCLUDED.district, pincode = EXCLUDED.pincode, type = EXCLUDED.type,
            source = EXCLUDED.source, status = EXCLUDED.status, enquiry = EXCLUDED.enquiry,
            last_purchased_date = EXCLUDED.last_purchased_date, branch_data = EXCLUDED.branch_data,
            under_sales_person = EXCLUDED.under_sales_person, create_date = EXCLUDED.create_date, age = EXCLUDED.age,
            tags = EXCLUDED.tags, last_updated_date = EXCLUDED.last_updated_date`;

        const restoredMobilenos = new Set();
        for (const contact of contactsToRestore) {
          await pool.query(upsertQuery, [
            contact.name,
            contact.customer_unique_code,
            contact.clinic_college_name,
            contact.designation,
            contact.department,
            contact.address,
            contact.mobileno,
            contact.whatsapp_availability,
            contact.alternative_mobile_no,
            contact.alternative_mobile_no2,
            contact.alternative_mobile_no3,
            contact.telephone,
            contact.drug_license_no,
            contact.gst,
            contact.email_id,
            contact.website,
            contact.city,
            contact.state,
            contact.country,
            contact.district,
            contact.pincode,
            contact.type,
            contact.source,
            contact.status,
            contact.enquiry,
            contact.last_purchased_date,
            contact.branch_data,
            contact.under_sales_person,
            contact.create_date,
            contact.age,
            contact.tags,
            contact.last_updated_date,
          ]);
          restoredMobilenos.add(contact.mobileno);
        }

        // Delete matching entries from contacts_backup table
        await pool.query(
          `DELETE FROM contacts_backup WHERE mobileno = ANY($1::bigint[])`,
          [Array.from(restoredMobilenos)]
        );

        // Delete the file from Cloudinary after successful restore
        try {
          const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw",
          });

          if (result.result === "ok") {
            console.log(
              `File ${decodedFileName} deleted successfully from Cloudinary.`
            );
            res
              .status(200)
              .send(
                "Data restore completed, matching backup entries removed, and file deleted from Cloudinary."
              );
          } else {
            console.error(
              `Failed to delete file from Cloudinary: ${decodedFileName}`
            );
            res
              .status(404)
              .send(`File ${decodedFileName} not found on Cloudinary.`);
          }
        } catch (error) {
          console.error("Error deleting file from Cloudinary:", error);
          res.status(500).send("Error during cleanup after restore");
        }
      })
      .on("error", (err) => {
        console.error("Error reading CSV from Cloudinary:", err);
        res.status(500).send("Error reading CSV file");
      });
  } catch (error) {
    console.error("Error restoring data:", error);
    res.status(500).send("Error restoring data");
  }
}

async function getAllBackupData(req, res) {
  try {
    let next_cursor = null; // Initialize next_cursor as null for the first request
    const allFiles = [];

    // Loop until there are no more results to fetch
    do {
      const response = await cloudinary.search
        .max_results(30) // Limit results per request
        .sort_by("public_id", "desc") // Optional: sort by file name or other criteria
        .next_cursor(next_cursor) // Use the next_cursor from the previous response
        .execute();

      console.log("Cloudinary Search Response:", response);

      if (response.resources.length === 0) {
        console.log("No files found in Cloudinary.");
        break; // Exit if no files are found
      }

      // Debugging: Log the structure of each file
      response.resources.forEach((file) => {
        console.log("File Object Structure:", file); // This will show the full file object structure
      });

      // Ensure fileName and url are properly formatted as strings
      const files = response.resources.map((file) => {
        const fileName = file.public_id.split("/").pop(); // Get the file name only (no path)
        const url = file.secure_url; // Ensure it's a string (URL)

        return {
          fileName: fileName, // This should be a string, e.g., "backup.csv"
          url: url, // Ensure this is a string (URL)
          created_at: file.created_at, // This should be a date string (ISO format)
        };
      });

      allFiles.push(...files); // Add the current batch of files to the allFiles array

      next_cursor = response.next_cursor; // Update next_cursor to continue pagination if there are more results
    } while (next_cursor); // Continue looping if there is a next_cursor (more pages)

    // Send the files as a JSON response to the frontend
    res.json(allFiles);
  } catch (error) {
    console.error("Error fetching backup files from Cloudinary:", error);
    res.status(500).send("Error fetching backup files");
  }
}

async function getAllBackupFiles(req, res) {
  const { fileName } = req.params;

  // Ensure fileName is provided and is a valid string
  if (!fileName || typeof fileName !== "string") {
    return res
      .status(400)
      .send("File name is required and should be a valid string.");
  }

  try {
    // Construct the Cloudinary resource path
    const cloudinaryPath = `Home/${fileName}`; // Adjust this if files are stored in a different folder
    const file = await cloudinary.api.resource(cloudinaryPath);

    if (file) {
      // Redirect to the secure URL of the file if found
      return res.redirect(file.secure_url); // This should redirect to the correct file URL
    } else {
      // Handle the case when file is not found
      return res
        .status(404)
        .send(`File '${fileName}' not found in Cloudinary.`);
    }
  } catch (error) {
    // Log the error to get more insight into what went wrong
    console.error("Error fetching file from Cloudinary:", error);

    // Check if the error is due to Cloudinary not finding the file or some other issue
    if (error.message.includes("not found")) {
      return res.status(404).send("File not found in Cloudinary.");
    } else {
      // For any other error, return a 500 status
      return res.status(500).send("Error fetching file from Cloudinary.");
    }
  }
}

const handleDeleteBackupFiles = async (req, res) => {
  const { fileName } = req.params;

  // Decode fileName if it's URL-encoded
  const decodedFileName = decodeURIComponent(fileName);
  console.log("Decoded file name:", decodedFileName);

  if (!decodedFileName) return res.status(400).send("File name is required");

  try {
    const publicId = `backups/${decodedFileName}`; // Ensure this matches the public ID format in Cloudinary
    console.log(
      "Attempting to delete file from Cloudinary with public ID:",
      publicId
    );

    // Delete the file directly from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw", // Specify resource type if necessary (e.g., 'image', 'video', or 'raw')
    });

    // Check the result of the deletion
    if (result.result === "ok") {
      console.log(
        `File ${decodedFileName} deleted successfully from Cloudinary.`
      );
      res
        .status(200)
        .send(`File ${decodedFileName} deleted successfully from Cloudinary.`);
    } else {
      console.error(`Failed to delete file: ${decodedFileName}`);
      res.status(404).send(`File ${decodedFileName} not found on Cloudinary.`);
    }
  } catch (error) {
    console.error("Error in deleting file from Cloudinary:", error);
    res.status(500).send("Error in deleting file from Cloudinary");
  }
};

async function handleDeleteData(req, res) {
  const { mobileno } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM contacts_delete WHERE mobileno = $1",
      [mobileno]
    );

    if (result.rowCount > 0) {
      return res
        .status(200)
        .json({ message: "Backup data deleted successfully" });
    } else {
      return res.status(404).json({ message: "Backup data not found" });
    }
  } catch (error) {
    console.error("Error deleting backup data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleDeleteAllData(req, res) {
  try {
    const deleteAllData = await pool.query("DELETE FROM contacts_delete");
    if (deleteAllData.rowCount === 0) {
      return res.status(404).json({ error: "No users found to delete" });
    }

    return res.status(200).json({ message: "All users deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function getAllDeletedData(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM contacts_delete ORDER BY backup_date DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function restoreDeletedData(req, res) {
  const { mobileno } = req.body;

  try {
    // Fetch data from backup
    const result = await pool.query(
      "SELECT * FROM contacts_delete WHERE mobileno = $1",
      [mobileno]
    );
    const backupData = result.rows[0];

    if (backupData) {
      // Restore data to contacts table
      await pool.query(
        `INSERT INTO contacts (
              mobileno, name, customer_unique_code, clinic_college_name, designation, department, address, 
              whatsapp_availability, alternative_mobile_no, alternative_mobile_no2, alternative_mobile_no3, 
              telephone, drug_license_no, gst, email_id, website, city, state, country, district, pincode, 
              type, source, status, enquiry, last_purchased_date, branch_data, under_sales_person, 
              create_date, age, tags, last_updated_date
          ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
              $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
          ) ON CONFLICT (mobileno) DO UPDATE SET 
              name = EXCLUDED.name, 
              customer_unique_code = EXCLUDED.customer_unique_code, 
              clinic_college_name = EXCLUDED.clinic_college_name, 
              designation = EXCLUDED.designation, 
              department = EXCLUDED.department,
              address = EXCLUDED.address, 
              whatsapp_availability = EXCLUDED.whatsapp_availability, 
              alternative_mobile_no = EXCLUDED.alternative_mobile_no, 
              alternative_mobile_no2 = EXCLUDED.alternative_mobile_no2, 
              alternative_mobile_no3 = EXCLUDED.alternative_mobile_no3, 
              telephone = EXCLUDED.telephone, 
              drug_license_no = EXCLUDED.drug_license_no, 
              gst = EXCLUDED.gst, 
              email_id = EXCLUDED.email_id, 
              website = EXCLUDED.website, 
              city = EXCLUDED.city, 
              state = EXCLUDED.state, 
              country = EXCLUDED.country, 
              district = EXCLUDED.district, 
              pincode = EXCLUDED.pincode, 
              type = EXCLUDED.type, 
              source = EXCLUDED.source, 
              status = EXCLUDED.status, 
              enquiry = EXCLUDED.enquiry, 
              last_purchased_date = EXCLUDED.last_purchased_date, 
              branch_data = EXCLUDED.branch_data, 
              under_sales_person = EXCLUDED.under_sales_person, 
              create_date = EXCLUDED.create_date, 
              age = EXCLUDED.age, 
              tags = EXCLUDED.tags, 
              last_updated_date = EXCLUDED.last_updated_date
          `,
        [
          backupData.mobileno,
          backupData.name,
          backupData.customer_unique_code,
          backupData.clinic_college_name,
          backupData.designation,
          backupData.department,
          backupData.address,
          backupData.whatsapp_availability,
          backupData.alternative_mobile_no,
          backupData.alternative_mobile_no2,
          backupData.alternative_mobile_no3,
          backupData.telephone,
          backupData.drug_license_no,
          backupData.gst,
          backupData.email_id,
          backupData.website,
          backupData.city,
          backupData.state,
          backupData.country,
          backupData.district,
          backupData.pincode,
          backupData.type,
          backupData.source,
          backupData.status,
          backupData.enquiry,
          backupData.last_purchased_date,
          backupData.branch_data,
          backupData.under_sales_person,
          backupData.create_date,
          backupData.age,
          backupData.tags,
          backupData.last_updated_date,
        ]
      );

      // Optionally, delete the restored record from the backup
      await pool.query("DELETE FROM contacts_delete WHERE mobileno = $1", [
        mobileno,
      ]);

      res.json({ message: "Data restored successfully" });
    } else {
      res.status(404).json({ message: "Backup data not found" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
}

async function handleAllDeletedData(req,res){
  try{
    await pool.query("DELETE FROM contacts_delete");
    console.log("All data deleted successfully");
  }catch(error){
    console.error(error);
    res.status(500).json(error);
  }
}

module.exports = {
  handleBackupAllData,
  handleRestoreAllData,
  getAllBackupData,
  getAllBackupFiles,
  handleDeleteBackupFiles,
  handleDeleteData,
  handleDeleteAllData,
  getAllDeletedData,
  restoreDeletedData,
  handleAllDeletedData
};

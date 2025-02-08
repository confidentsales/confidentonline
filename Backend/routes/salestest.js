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

const upload = multer({ storage: multer.memoryStorage() })

const columnMapping = {
    sales_person: "Sales Person",
    voucher_number: "Voucher Number",
    reference: "Reference",
    date: "Date",
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
  };

  router.post("/sales-analyze",upload.single(file),async(req,res)=>{
    const results = [];

    try {
        if (!req.file) {
          return res.status(400).send("No file uploaded");
        }
    
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer); // Load the file from memory
        const worksheet = workbook.getWorksheet(1);
        const excelHeaders = worksheet.getRow(1).values.slice(1);


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


          
    }catch(error){

    }
  })
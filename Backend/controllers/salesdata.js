const express = require("express");
const cors = require("cors");
const router = express.Router();
const pool = require("../db");

router.use(cors());
router.use(express.json());

async function createSalesData(req, res) {
  const {
    sl_no,
    year,
    sales_person,
    voucher_number,
    reference,
    date,
    month,
    voucher_type,
    party_name,
    party_state,
    district,
    party_alias,
    party_ledger_parent,
    gst_number,
    item_name,
    item_alias,
    item_hsncode,
    item_part_no,
    brand,
    item_confident_group,
    godown,
    item_batch,
    actual_quantity,
    billed_quantity,
    alternate_actual_quantity,
    alternate_billed_quantity,
    rate,
    unit,
    discount,
    discount_amount,
    amount,
    sales_ledger,
    narration,
    offer_type,
    mobileno
  } = req.body;

  const sanitizeInput = (input) => (input === "" ? null : input);

  try {
    const insertQuery = `INSERT INTO sales (
    sl_no,
    year,
    sales_person,
    voucher_number,
    reference,
    date,
    month,
    voucher_type,
    party_name,
    party_state,
    district,
    party_alias,
    party_ledger_parent,
    gst_number,
    item_name,
    item_alias,
    item_hsncode,
    item_part_no,
    brand,
    item_confident_group,
    godown,
    item_batch,
    actual_quantity,
    billed_quantity,
    alternate_actual_quantity,
    alternate_billed_quantity,
    rate,
    unit,
    discount,
    discount_amount,
    amount,
    sales_ledger,
    narration,
    offer_type,
    mobileno
    )VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31,$32,$33,$34) RETURNING *`;

    const result = await pool.query(insertQuery, [
      sanitizeInput(sl_no),
      sanitizeInput(year),
      sanitizeInput(sales_person),
      sanitizeInput(voucher_number),
      sanitizeInput(reference),
      sanitizeInput(date),
      sanitizeInput(month),
      sanitizeInput(voucher_type),
      sanitizeInput(party_name),
      sanitizeInput(party_state),
      sanitizeInput(district),
      sanitizeInput(party_alias),
      sanitizeInput(party_ledger_parent),
      sanitizeInput(gst_number),
      sanitizeInput(item_name),
      sanitizeInput(item_alias),
      sanitizeInput(item_hsncode),
      sanitizeInput(item_part_no),
      sanitizeInput(brand),
      sanitizeInput(item_confident_group),
      sanitizeInput(godown),
      sanitizeInput(item_batch),
      sanitizeInput(actual_quantity),
      sanitizeInput(billed_quantity),
      sanitizeInput(alternate_actual_quantity),
      sanitizeInput(alternate_billed_quantity),
      sanitizeInput(rate),
      sanitizeInput(unit),
      sanitizeInput(discount),
      sanitizeInput(discount_amount),
      sanitizeInput(amount),
      sanitizeInput(sales_ledger),
      sanitizeInput(narration),
      sanitizeInput(offer_type),
      sanitizeInput(mobileno),
    ]);

    console.log("data created successfully");
    res.status(200).json({ message: "new data created successfully" });
  } catch (err) {
    const errorResponse = {
      message: "An error occurred while creating sales data",
      error: err.message || "Unknown error",
    };

    console.error("Error creating new Sales data:", err.message || err);
    res.status(500).json(errorResponse);
  }
}

async function handleGetAllSalesData(req, res) {
  try {
    const getSales = await pool.query("SELECT * FROM sales ");
    if (getSales.rows.length === 0) {
      return res.status(404).json({ error: "no data found " });
    }
    return res.status(200).json(getSales.rows);
  } catch (error) {
    console.log("somer error occured", error);
    res.status(500).json({ message: "some error occured" });
  }
}

async function handleGetSingleSalesData(req, res) {
  const { sl_no } = req.params;
  const id = parseInt(sl_no, 10); // Convert sl_no to an integer

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid Sales ID" });
  }

  try {
    const result = await pool.query("SELECT * FROM sales WHERE sl_no = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sales data not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching sales data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleUpdateSalesData(req, res) {
  const { sl_no } = req.params;
  const id = parseInt(sl_no, 10); // Convert sl_no to an integer
  const {
    year,
    sales_person,
    voucher_number,
    reference,
    date,
    month,
    voucher_type,
    party_name,
    party_state,
    district,
    party_alias,
    party_ledger_parent,
    gst_number,
    item_name,
    item_alias,
    item_hsncode,
    item_part_no,
    brand,
    item_confident_group,
    godown,
    item_batch,
    actual_quantity,
    billed_quantity,
    alternate_actual_quantity,
    alternate_billed_quantity,
    rate,
    unit,
    discount,
    discount_amount,
    amount,
    sales_ledger,
    narration,
    offer_type,
    mobileno
  } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid Sales ID" });
  }

  let updatedLastUpdatedDate = new Date().toISOString();

  const parseAndFormatDate = (dateString) => {
    if (!dateString) return null; // Return null if empty
    try {
      const [day, month, year] = dateString.split("-").map(Number); // Assume DD-MM-YYYY format
      const formattedDate = new Date(year, month - 1, day); // JS months are 0-based
      if (isNaN(formattedDate.getTime())) {
        throw new Error("Invalid date");
      }
      return formattedDate.toISOString().split("T")[0]; // Return 'YYYY-MM-DD'
    } catch (error) {
      console.error(`Invalid date input: ${dateString}`);
      return null;
    }
  };

  // Function to convert empty strings to null
  const sanitizeInput = (input) => (input === "" ? null : input);

  try {
    // Proceed with the update
    const updateQuery = `
        UPDATE sales
        SET year = $1,
            sales_person = $2,
            voucher_number = $3,
            reference = $4,
            date = $5,
            month = $6,
            voucher_type = $7,
            party_name = $8,
            party_state = $9,
            district = $10,
            party_alias = $11,
            party_ledger_parent = $12,
            gst_number = $13,
            item_name = $14,
            item_alias = $15,
            item_hsncode = $16,
            item_part_no = $17,
            brand = $18,
            item_confident_group = $19,
            godown = $20,
            item_batch = $21,
            actual_quantity = $22,
            billed_quantity = $23,
            alternate_actual_quantity = $24,
            alternate_billed_quantity = $25,
            rate = $26,
            unit = $27,
            discount = $28,
            discount_amount = $29,
            amount = $30,
            sales_ledger = $31,
            narration = $32,
            offer_type = $33,
            last_updated_date = $34,
            mobileno = $35
            
        WHERE sl_no = $36
        RETURNING *;
      `;

    const updateResult = await pool.query(updateQuery, [
      year,
      sales_person,
      voucher_number,
      reference,
      parseAndFormatDate(date),
      month,
      voucher_type,
      party_name,
      party_state,
      district,
      party_alias,
      party_ledger_parent,
      gst_number,
      item_name,
      item_alias,
      item_hsncode,
      item_part_no,
      brand,
      item_confident_group,
      godown,
      item_batch,
      actual_quantity,
      billed_quantity,
      alternate_actual_quantity,
      alternate_billed_quantity,
      rate,
      unit,
      discount,
      discount_amount,
      amount,
      sales_ledger,
      narration,
      offer_type,
      updatedLastUpdatedDate, // Use the updated variable here
      mobileno,
      id,
    ]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: "Sales data not found for update" });
    }

    // Return the updated user
    return res.status(200).json({
      message: "Data updated successfully",
      user: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error updating Sales Data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleDeleteSelectedSalesData(req, res) {
  const { ids } = req.body; // Expecting an array of sl_no IDs to delete

  if (!Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid request: IDs must be an array." });
  }

  try {
    // Proceed with the delete operation using "WHERE IN"
    const deleteQuery = "DELETE FROM sales WHERE sl_no = ANY($1)";
    const deleteResult = await pool.query(deleteQuery, [ids]);

    // Check if any rows were affected
    if (deleteResult.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "No Sales data found for deletion" });
    }

    return res
      .status(200)
      .json({ message: "Sales data deleted successfully" });
  } catch (error) {
    console.error("Error deleting Sales data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function handleDeleteSalesData(req, res) {
  const { sl_no } = req.params;
  const id = parseInt(sl_no, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid Sales ID" });
  }

  try {
    // Proceed with the delete operation
    const deleteQuery = `
        DELETE FROM sales
        WHERE sl_no = $1
        RETURNING *;
      `;

    const deleteResult = await pool.query(deleteQuery, [id]);

    if (deleteResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Sales data not found for deletion" });
    }

    return res
      .status(200)
      .json({ message: "Sales Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting Sales data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function handleDeleteAllSalesData(req, res) {
  try {
    // Delete all sales data
    const deleteAllUsers = await pool.query("DELETE FROM sales");

    // Check if any rows were deleted
    if (deleteAllUsers.rowCount === 0) {
      return res.status(404).json({ error: "No Sales data found to delete" });
    }

    return res
      .status(200)
      .json({ message: "All Sales Data deleted successfully" });
  } catch (error) {
    console.error("Error deleting all Sales data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


module.exports = {
  createSalesData,
  handleGetAllSalesData,
  handleGetSingleSalesData,
  handleUpdateSalesData,
  handleDeleteSelectedSalesData,
  handleDeleteSalesData,
  handleDeleteAllSalesData,
};

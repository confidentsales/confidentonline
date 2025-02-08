const express = require("express");
const router = express.Router();
const cors = require("cors");
const {
  createSalesData,
  handleGetAllSalesData,
  handleGetSingleSalesData,
  handleUpdateSalesData,
  handleDeleteSelectedSalesData,
  handleDeleteSalesData,
  handleDeleteAllSalesData,
} = require("../controllers/salesdata");

router.use(express.json());

router
  .route("/")
  .post(createSalesData)
  .get(handleGetAllSalesData)
  .delete(handleDeleteSelectedSalesData);

router.route("/delete/all").delete(handleDeleteAllSalesData);

router
  .route("/:sl_no")
  //get Single user
  .get(handleGetSingleSalesData)
  // Update a user
  .put(handleUpdateSalesData)
  // Delete a user
  .delete(handleDeleteSalesData);

module.exports = router;

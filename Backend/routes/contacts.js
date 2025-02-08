const express = require("express");
const router = express.Router();
const cors = require("cors");

router.use(express.json());
const {
  handleCreateUsers,
  handleGetAllUsers,
  handleGetSingleUsers,
  handleUpdateUsers,
  handleDeleteUsers,
  handleDeleteSelectedUsers,
  handleDeleteAllUsers,
  handleCheckMobileNo,
} = require("../controllers/contacts");

router.use(cors());

router
  .route("/")
  // Create a user
  .post(handleCreateUsers)
  // Get all users
  .get(handleGetAllUsers)
  .delete(handleDeleteSelectedUsers);

router.route("/delete/all").delete(handleDeleteAllUsers);

router
  .route("/:sl_no")
  //get Single user
  .get(handleGetSingleUsers)
  // Update a user
  .put(handleUpdateUsers)
  // Delete a user
  .delete(handleDeleteUsers);

router.route("/check-mobileno").post(handleCheckMobileNo);

module.exports = router;

const express = require("express");
const { authorize, authenticate } = require("../../middleware/auth");
const {
  createBalagruha,
  getAllBalagruha,
  getBalagruhaById,
  updateBalagruha,
  deleteBalagruha,
  getBalagruhaListByUserId,
} = require("../../controllers/balagruha");
const router = express.Router();

// API for balagruha CRUD operations
router.post(
  "/",
  authenticate,
  authorize("User Management", "Create"),
  createBalagruha
);
router.get(
  "/",
  authenticate,
  authorize("User Management", "Read"),
  getAllBalagruha
);
router.get(
  "/:id",
  authenticate,
  authorize("User Management", "Read"),
  getBalagruhaById
);
router.put(
  "/:id",
  authenticate,
  authorize("User Management", "Update"),
  updateBalagruha
);
router.delete(
  "/:id",
  authenticate,
  authorize("User Management", "Delete"),
  deleteBalagruha
);
// API for fetch balagruha list by user id
router.get(
  "/user/:userId",
  authenticate,
  authorize("User Management", "Read"),
  getBalagruhaListByUserId
);
module.exports = router;

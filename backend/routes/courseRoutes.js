const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload"); // Multer middleware for file uploads
const courseController = require("../controllers/courseController");
const { authenticate, authorize } = require("../middleware/auth"); // Authentication and authorization middleware

// Create a new course (with file upload)
router.post(
  "/",
  authenticate, // Ensure the user is authenticated
  authorize("Course Management", "Create"), // Ensure the user has permission to create courses
  upload.any(), // Accept any file uploads (for modules/chapters/files)
  courseController.createCourse
);

module.exports = router;

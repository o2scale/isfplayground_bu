const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "text/plain",
    "text/csv",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limited to 5MB max for the time being
  fileFilter,
});

// WTF-specific upload configuration with support for media files
const wtfFileFilter = (req, file, cb) => {
  console.log("🔍 WTF File Filter - Processing file:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    fieldname: file.fieldname,
  });

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "audio/mpeg", // Standard MP3 MIME type
    "audio/mp3", // Alternative MP3 MIME type
    "audio/mpeg3", // Legacy MP3 MIME type
    "audio/wav",
    "audio/ogg",
    "audio/aac", // AAC audio support
    "audio/m4a", // M4A audio support
  ];

  console.log("📋 Allowed MIME types:", allowedTypes);
  console.log("🎯 File MIME type:", file.mimetype);
  console.log("🔍 Is MIME type allowed?", allowedTypes.includes(file.mimetype));

  if (allowedTypes.includes(file.mimetype)) {
    console.log("✅ WTF File Filter - File accepted:", file.mimetype);
    cb(null, true);
  } else {
    console.log("❌ WTF File Filter - File rejected:", file.mimetype);
    console.log("💡 Suggestion: Check if file extension matches MIME type");
    cb(
      new Error(
        `Invalid file type: ${
          file.mimetype
        }. Allowed types: ${allowedTypes.join(", ")}`
      )
    );
  }
};

const wtfUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Increased to 100MB for WTF media files
    files: 1, // Allow only 1 file at a time
    fieldSize: 10 * 1024 * 1024, // 10MB for field data
  },
  fileFilter: wtfFileFilter,
});

// Wrap the multer middleware to add error handling
const wtfUploadWithErrorHandling = (req, res, next) => {
  wtfUpload.single("file")(req, res, (err) => {
    if (err) {
      console.error("🚨 Multer Error:", {
        message: err.message,
        code: err.code,
        field: err.field,
        file: req.file,
        body: req.body,
      });

      // Handle specific multer errors
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is 100MB. Received: ${
            req.file
              ? (req.file.size / (1024 * 1024)).toFixed(2) + "MB"
              : "Unknown"
          }`,
        });
      }

      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message: "Too many files. Only 1 file allowed.",
        });
      }

      if (err.code === "LIMIT_FIELD_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Field data too large. Maximum size is 10MB.",
        });
      }

      // Generic multer error
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    }

    // Log successful file upload for debugging
    if (req.file) {
      console.log("✅ File uploaded successfully:", {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    }

    // No error, continue
    next();
  });
};

// Cleanup function to remove orphaned files
const cleanupOrphanedFiles = () => {
  const uploadsDir = "uploads/";

  try {
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      files.forEach((file) => {
        if (file === "uploaded_files_here.txt") return; // Skip the placeholder file

        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtime.getTime();

        // Remove files older than 24 hours
        if (age > maxAge) {
          try {
            fs.unlinkSync(filePath);
            console.log(`🧹 Cleaned up orphaned file: ${file}`);
          } catch (error) {
            console.error(`❌ Failed to clean up file ${file}:`, error.message);
          }
        }
      });
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
  }
};

// Run cleanup every hour
setInterval(cleanupOrphanedFiles, 60 * 60 * 1000);

// Run initial cleanup
cleanupOrphanedFiles();

module.exports = {
  upload,
  wtfUpload,
  wtfUploadWithErrorHandling,
  cleanupOrphanedFiles,
};

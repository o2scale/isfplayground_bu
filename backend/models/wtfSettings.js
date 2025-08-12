const mongoose = require("mongoose");

const wtfSettingsSchema = new mongoose.Schema(
  {
    backgroundType: {
      type: String,
      enum: ["color", "image"],
      default: "color",
    },
    backgroundColor: {
      type: String,
      default: "#f8fafc", // Default light gray
      validate: {
        validator: function (v) {
          // Validate hex color format
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Background color must be a valid hex color",
      },
    },
    backgroundImage: {
      type: String,
      default: null, // S3 URL for background image
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active setting at a time
wtfSettingsSchema.index(
  { isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.model("WtfSettings", wtfSettingsSchema);

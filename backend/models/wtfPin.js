const mongoose = require("mongoose");

const wtfPinSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "audio", "text", "link"],
      required: [true, "Pin type is required"],
    },
    mediaUrl: {
      type: String,
      required: function () {
        return ["image", "video", "audio"].includes(this.type);
      },
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // Duration in seconds for video/audio
      min: [0, "Duration cannot be negative"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    status: {
      type: String,
      enum: ["active", "unpinned", "archived", "expired"],
      default: "active",
    },
    isOfficial: {
      type: Boolean,
      default: false, // ISF Official Post
    },
    language: {
      type: String,
      enum: ["hindi", "english", "both"],
      default: "english",
    },
    tags: [{ type: String, trim: true }],
    expiresAt: {
      type: Date,
      default: function () {
        // Default expiration: 7 days from creation
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date;
      },
    },
    engagementMetrics: {
      likes: { type: Number, default: 0 },
      seen: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    // For link type pins
    linkUrl: {
      type: String,
      required: function () {
        return this.type === "link";
      },
      trim: true,
      match: [
        /^https?:\/\/.+/,
        "Please enter a valid URL starting with http:// or https://",
      ],
    },
    linkTitle: {
      type: String,
      trim: true,
    },
    linkDescription: {
      type: String,
      trim: true,
    },
    linkThumbnail: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    // Add indexes for performance
    indexes: [
      { status: 1, createdAt: -1 }, // For active pins query
      { author: 1, createdAt: -1 }, // For author's pins
      { type: 1, status: 1 }, // For type-based queries
      { expiresAt: 1 }, // For expiration queries
      { isOfficial: 1, status: 1 }, // For official posts
    ],
  }
);

// Virtual for engagement rate
wtfPinSchema.virtual("engagementRate").get(function () {
  if (this.engagementMetrics.seen === 0) return 0;
  return (this.engagementMetrics.likes / this.engagementMetrics.seen) * 100;
});

// Virtual for days until expiration
wtfPinSchema.virtual("daysUntilExpiration").get(function () {
  if (!this.expiresAt) return null;
  const now = new Date();
  const diffTime = this.expiresAt - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for isExpired
wtfPinSchema.virtual("isExpired").get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Pre-save middleware to validate content based on type
wtfPinSchema.pre("save", function (next) {
  // Validate content length based on type
  if (this.type === "text" && this.content.length > 5000) {
    return next(new Error("Text content cannot exceed 5000 characters"));
  }

  // Validate media URL for media types
  if (["image", "video", "audio"].includes(this.type) && !this.mediaUrl) {
    return next(new Error("Media URL is required for media type pins"));
  }

  next();
});

// Instance method to check if pin is active
wtfPinSchema.methods.isActive = function () {
  return this.status === "active" && !this.isExpired;
};

// Instance method to update engagement metrics
wtfPinSchema.methods.updateEngagementMetrics = function (metrics) {
  Object.assign(this.engagementMetrics, metrics);
  return this.save();
};

// Static method to get active pins
wtfPinSchema.statics.getActivePins = function (limit = 20, skip = 0) {
  return this.find({
    status: "active",
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate("author", "name role");
};

// Static method to get expired pins
wtfPinSchema.statics.getExpiredPins = function () {
  return this.find({
    status: "active",
    expiresAt: { $lte: new Date() },
  });
};

// Static method to find active pins (alias for getActivePins)
wtfPinSchema.statics.findActivePins = function () {
  return this.getActivePins();
};

// Static method to find expired pins (alias for getExpiredPins)
wtfPinSchema.statics.findExpiredPins = function () {
  return this.getExpiredPins();
};

const WtfPin = mongoose.model("wtf_pin", wtfPinSchema);

module.exports = WtfPin;

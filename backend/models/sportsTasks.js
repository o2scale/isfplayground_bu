const mongoose = require("mongoose");

const sportsTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    drillOrExerciseType: { type: String, default: "" },
    duration: { type: String, default: "" },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to the User model
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to the creator (Admin or Coach)
    deadline: { type: Date, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in progress", "completed"],
      default: "pending",
    },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        attachments: [
          {
            fileName: { type: String },
            fileUrl: { type: String },
            fileType: { type: String },
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the User model who uploaded the file
            uploadedAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the User model who uploaded the file
        uploadedAt: { type: Date, default: Date.now },
      },
    ], // URLs or file paths for attachments
    performanceMetrics: {
      time: { type: String, default: "" },
      score: { type: String, default: "" },
      repetitions: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const SportsTask = mongoose.model("sports_tasks", sportsTaskSchema);

module.exports = SportsTask;

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // This allows multiple null values by indexing only non-null values
      required: false, // Makes the field optional
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: false, // Changed from true to false to make it optional
      // minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: [
        "admin",
        "coach",
        "balagruha-incharge",
        "student",
        "purchase-manager",
        "medical-incharge",
        "sports-coach",
        "music-coach",
        "amma",
      ],
      required: [true, "Role is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    lastLogin: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    age: {
      type: Number,
      required: function () {
        return this.role === "student";
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: function () {
        return this.role === "student";
      },
    },
    balagruhaIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Balagruha" }],
    parentalStatus: {
      type: String,
      enum: ["has both", "has one", "has none", "has guardian", ""],
      default: "",
    },
    guardianName1: { type: String },
    guardianName2: { type: String },
    guardianContact1: { type: String },
    guardianContact2: { type: String },
    // guardianContact: { type: String },
    performanceReports: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
    ],
    attendanceRecords: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Attendance" },
    ],
    medicalRecords: [
      { type: mongoose.Schema.Types.ObjectId, ref: "MedicalRecord" },
    ],
    assignedMachines: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Machine" },
    ],
    facialData: {
      faceDescriptor: Array, // Store face descriptor array
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// hashing passwords
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    if (this.password && this.password !== "") {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  // If lock has expired, reset attempts and remove lock
  if (this.lockUntil && this.lockUntil < Date.now()) {
    await this.updateOne({
      loginAttempts: 1,
      $unset: { lockUntil: 1 },
    });
  } else {
    const updates = { $inc: { loginAttempts: 1 } };

    if (this.loginAttempts + 1 >= 5) {
      updates.$set = { lockUntil: Date.now() + 1800000 };
    }

    return await this.updateOne(updates);
  }
};

userSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // You'll need to install this package

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        email: {
            type: String,
            // Remove unique constraint from schema definition
            sparse: true,
            required: false,
            default: null,
            trim: true,
            lowercase: true,
            validate: {
                validator: async function (value) {
                    // Skip validation if email is null or empty
                    if (!value) return true;

                    // Check if email already exists
                    const count = await mongoose.models.User.countDocuments({
                        email: value,
                        _id: { $ne: this._id } // Exclude current document for updates
                    });

                    return count === 0;
                },
                message: 'Email must be unique when provided'
            },
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        userId: {
            type: Number,
            // Remove unique constraint from schema definition
            sparse: true,
            required: false,
            default: null,
            validate: {
                validator: async function (value) {
                    // Skip validation if userId is null or undefined
                    if (value === null || value === undefined) return true;

                    // Check if userId already exists
                    const count = await mongoose.models.User.countDocuments({
                        userId: value,
                        _id: { $ne: this._id } // Exclude current document for updates
                    });

                    return count === 0;
                },
                message: 'User ID must be unique when provided'
            }
        },
        password: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            enum: ['admin', 'coach', 'balagruha-incharge', 'student', 'purchase-manager',
                'medical-incharge', 'sports-coach', 'music-coach', 'amma'],
            required: [true, 'Role is required']
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        lastLogin: {
            type: Date
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: Date,
        age: {
            type: Number,
            required: function () {
                return this.role === 'student';
            }
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: function () {
                return this.role === 'student';
            }
        },
        balagruhaIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Balagruha' }],
        parentalStatus: { type: String, enum: ['has both', 'has one', 'has none', 'has guardian', ""], default: "" },
        guardianName1: { type: String },
        guardianName2: { type: String },
        guardianContact1: { type: String },
        guardianContact2: { type: String },
        performanceReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
        attendanceRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }],
        medicalRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }],
        assignedMachines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Machine' }],
        facialData: {
            faceDescriptor: Array,
            createdAt: { type: Date, default: Date.now }
        },
        generatedId: { type: String, default: "" }
    },
    { timestamps: true }
);

// Define indexes without unique constraints
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ userId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ generatedId: 1 });

// hashing passwords 
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

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

// Rest of your methods remain the same
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = async function () {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        await this.updateOne({
            loginAttempts: 1,
            $unset: { lockUntil: 1 }
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
        $unset: { lockUntil: 1 }
    });
};

userSchema.statics.getUserIdFromGeneratedId = async function (generatedId) {
    try {
        const user = await this.findOne({ generatedId: generatedId });
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        return { success: true, data: user };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Updated reindexCollection function
userSchema.statics.reindexCollection = async function () {
    try {
        // Drop all indexes except the _id index
        await this.collection.dropIndexes();

        // Rebuild indexes WITHOUT making email or userId unique
        await this.collection.createIndex({ email: 1 }, { sparse: true });
        await this.collection.createIndex({ userId: 1 }, { sparse: true });
        await this.collection.createIndex({ role: 1 });
        await this.collection.createIndex({ status: 1 });
        await this.collection.createIndex({ generatedId: 1 });

        return {
            success: true,
            message: 'User collection has been successfully re-indexed'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to re-index user collection',
            error: error.message
        };
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
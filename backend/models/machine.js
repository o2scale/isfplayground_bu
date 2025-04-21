const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema(
    {
        machineId: {
            type: String,
            required: true,
            unique: true,
        },
        macAddress: {
            type: String,
            required: true,
            unique: true,
        },
        serialNumber: {
            type: String,
            required: true,
            unique: true,
        },
        assignedBalagruha: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Balagruha',
            default: null,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'maintenance'],
            default: 'active',
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        generatedId: {
            type: String,
            unique: true,
            sparse: true,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Add sparse index to allow duplicate null values
MachineSchema.index({ generatedId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Machine', MachineSchema);
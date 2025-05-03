const mongoose = require('mongoose');

const medicalCheckInSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        temperature: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        healthStatus: {
            type: String,
            enum: ['normal', 'warning', 'alert'],
            default: 'normal'
        },
        notes: {
            type: String
        },
        attachments: [{
            fileName: { type: String },
            fileUrl: { type: String },
            fileType: { type: String },
            fileSize: { type: Number },
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            uploadedAt: { type: Date, default: Date.now }
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

const MedicalCheckIn = mongoose.model('medical_check_ins', medicalCheckInSchema);

module.exports = MedicalCheckIn;

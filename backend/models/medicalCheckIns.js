const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicalCheckInSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },
    mood: {
        type: String,
        required: true,
        enum: ['Happy', 'Sad', 'Neutral', 'Tired', 'Energetic', 'Irritable', 'Anxious', 'Calm'] // Adjust based on actual mood options
    },
    healthObservations: {
        type: String,
        required: false
    },
    images: [{
        filename: String,
        path: String,
        contentType: String,
        size: Number
    }],
    pdfs: [{
        filename: String,
        path: String,
        contentType: String,
        size: Number
    }],
    medicalNotes: [{
        note: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

// Create indexes for faster queries
medicalCheckInSchema.index({ student: 1, dateTime: -1 });

const MedicalCheckIn = mongoose.model('MedicalCheckIn', medicalCheckInSchema);

module.exports = MedicalCheckIn;

// models/Course.js

const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    fileName: String,
    fileType: String,
    fileUrl: String,
});

const QuizSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
    // time: { type: Number, default: 30 }, // time in seconds
});

const ChapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    videoTitle: { type: String },
    videoUrl: { type: String },
    uploadLink: { type: String },
    files: [FileSchema],
    quizzes: [QuizSchema],
});

const ModuleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    chapters: [ChapterSchema],
});

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    duration: { type: String },
    difficultyLevel: { type: String },
    thumbnail: { type: String },
    enableCoinReward: { type: Boolean, default: false },
    coinsOnCompletion: { type: Number, default: 0 },
    modules: [ModuleSchema],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    assignedBalagruha: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Balagruha' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);

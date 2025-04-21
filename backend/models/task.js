const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        generatedId: { type: String, unique: true }, // Unique identifier for the task
        title: { type: String, required: true },
        description: { type: String, required: true },
        drillOrExerciseType: { type: String, default: "" }, // for sports based tasks
        duration: { type: String, default: "" }, // for sports based tasks
        assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the creator (Admin or Coach)
        deadline: { type: Date, required: true },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        status: { type: String, enum: ['pending', 'in progress', 'completed'], default: 'pending' },
        labels: [{ type: String }], // Array of labels for categorization
        type: { type: String, enum: ['sports', 'fitness', 'nutrition', 'general', 'music', 'purchase', 'repair'], default: 'general' }, // Type of task (sports, fitness, nutrition)
        comments: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                comment: { type: String },
                attachments: [{
                    fileName: { type: String },
                    fileUrl: { type: String },
                    fileType: { type: String },
                    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model who uploaded the file
                    uploadedAt: { type: Date, default: Date.now }
                }],
                createdAt: { type: Date, default: Date.now },
            },
        ],
        attachments: [{
            fileName: { type: String },
            fileUrl: { type: String },
            fileType: { type: String },
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model who uploaded the file
            uploadedAt: { type: Date, default: Date.now }
        }], // URLs or file paths for attachments

        performanceMetrics: {
            time: { type: String, default: "" },
            score: { type: String, default: "" },
            repetitions: { type: String, default: "" },
        },

        // for the purchase orders
        machineDetails: { type: String, default: "", },
        vendorDetails: { type: String, default: "", },
        costEstimate: { type: Number, default: 0 },
        requiredParts: { type: String, default: "" },

        // for the repair
        repairDetails: { type: String },


    },
    { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
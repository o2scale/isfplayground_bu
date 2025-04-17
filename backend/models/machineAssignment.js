const mongoose = require('mongoose');

const MachineAssignmentHistorySchema = new mongoose.Schema(
    {
        HistoryID: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true,
        },
        MachineID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Machine',
            required: true,
        },
        PreviousBalagruhaID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Balagruha',
            default: null,
        },
        NewBalagruhaID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Balagruha',
            required: true,
        },
        AssignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        AssignmentDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('MachineAssignmentHistory', MachineAssignmentHistorySchema);
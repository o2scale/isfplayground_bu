const mongoose = require('mongoose');

const BalagruhaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        assignedMachines: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Machine',
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },   // ✅ Ensures `_id` appears
        toObject: { virtuals: true }  // ✅ Ensures `_id` appears
    }
);

// module.exports = mongoose.model('Balagruha', BalagruhaSchema);
module.exports = Balagruha = mongoose.model('Balagruha', BalagruhaSchema);
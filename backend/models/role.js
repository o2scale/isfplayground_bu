const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    {
        roleName: { type: String, required: true, unique: true },
        permissions: [
            {
                module: { type: String, required: true }, // Module name (e.g., User Management)
                actions: [
                    { type: String, enum: ['Create', 'Read', 'Update', 'Delete'] }, // Allowed actions
                ],
            },
        ],
    },
    { timestamps: true }
);

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
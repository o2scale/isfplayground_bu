// models/OfflineRequestQueue.js
const mongoose = require('mongoose');

const OfflineRequestQueueSchema = new mongoose.Schema({
    operation: { type: String, required: true }, // e.g. "createTask", "uploadFile"
    apiPath: { type: String, required: true },   // e.g. "/api/tasks", "/api/users"
    method: { type: String, default: "POST" },   // POST/PUT/DELETE
    payload: { type: mongoose.Schema.Types.Mixed, required: true }, // raw request body
    attachmentString: { type: String, default: '' }, // stringified version of attachments
    attachments: [{                               // store files if needed
        filePath: String,
        fieldName: String, // e.g. 'attachments'
    }],
    status: { type: String, default: 'pending' }, // pending, synced, failed
    error: { type: String, default: '' },         // in case sync fails
    token: { type: String, default: '' },         // token for authentication
    generatedId: { type: String, default: '' }, // generated ID for the request
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
},
    {
        timestamps: true,
    });

module.exports = mongoose.model('offline_request_queue', OfflineRequestQueueSchema);

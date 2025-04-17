const { default: mongoose } = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
    {
        machineDetails: { type: String, default: "", required: true },
        vendorDetails: { type: String, default: "", required: true },
        costEstimate: { type: Number, default: 0 },
        requiredParts: { type: String, default: "" },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending'
        },
        attachments: [{
            fileName: { type: String },
            fileUrl: { type: String },
            fileType: { type: String },
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            uploadedAt: { type: Date, default: Date.now }
        }], // URLs or file paths for attachments
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

const PurchaseOrder = mongoose.model('purchase_orders', purchaseOrderSchema);

module.exports = PurchaseOrder;
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const TransferOrderSchema = new mongoose_1.Schema({
    companyId: { type: String, index: true },
    orgId: { type: String, index: true },
    transferNumber: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    fromWarehouse: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksWarehouse', required: true },
    toWarehouse: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksWarehouse', required: true },
    status: { type: String, enum: ['Draft', 'In Transit', 'Received', 'Cancelled'], default: 'Draft' },
    approvalStatus: { type: String, enum: ['Draft', 'Pending', 'Approved', 'Rejected'], default: 'Draft' },
    dispatchDate: { type: Date },
    receivedDate: { type: Date },
    carrier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    shippingNotes: { type: String, default: '' },
    items: [{
            item: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            fromBin: { type: String, default: '' },
            toBin: { type: String, default: '' },
            serialNumbers: [{ type: String }],
            batchNo: { type: String, default: '' },
            unitCost: { type: Number, default: 0 }
        }],
    dispatchedBy: { type: String },
    receivedBy: { type: String },
    createdBy: { type: String }
}, { timestamps: true });
TransferOrderSchema.index({ companyId: 1, transferNumber: 1 });
TransferOrderSchema.index({ orgId: 1, transferNumber: 1 });
exports.default = mongoose_1.default.models.BooksTransferOrder || mongoose_1.default.model('BooksTransferOrder', TransferOrderSchema);

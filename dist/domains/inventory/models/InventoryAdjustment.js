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
const InventoryAdjustmentSchema = new mongoose_1.Schema({
    companyId: { type: String, index: true },
    orgId: { type: String, index: true },
    warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksWarehouse' },
    mode: { type: String, enum: ['quantity', 'value'], default: 'quantity' },
    referenceNumber: { type: String, default: '' },
    date: { type: Date, required: true, default: Date.now },
    reason: { type: String, required: true },
    description: { type: String, default: '' },
    account: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Adjusted', 'Cancelled'], default: 'Adjusted' },
    approvalStatus: { type: String, enum: ['Draft', 'Pending', 'Approved', 'Rejected'], default: 'Approved' },
    totalValue: { type: Number, default: 0 },
    items: [{
            item: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
            warehouse: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksWarehouse' },
            currentStock: { type: Number, default: 0 },
            quantityAdjusted: { type: Number, required: true },
            newStock: { type: Number, default: 0 },
            unitCost: { type: Number, default: 0 },
            valueAdjusted: { type: Number, default: 0 }
        }],
    createdBy: { type: String }
}, { timestamps: true });
InventoryAdjustmentSchema.index({ companyId: 1, referenceNumber: 1 });
InventoryAdjustmentSchema.index({ orgId: 1, referenceNumber: 1 });
exports.default = mongoose_1.default.models.BooksInventoryAdjustment || mongoose_1.default.model('BooksInventoryAdjustment', InventoryAdjustmentSchema);

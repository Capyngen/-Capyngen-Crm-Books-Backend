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
const SalesReturnSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.Mixed, index: true },
    orgId: { type: String, index: true },
    rmaNumber: { type: String, required: true },
    salesOrderId: { type: mongoose_1.Schema.Types.Mixed, ref: 'SalesOrder' },
    salesOrderNumber: { type: String, default: '' },
    customerId: { type: mongoose_1.Schema.Types.Mixed, ref: 'ClientAccount' },
    customerName: { type: String, default: '' },
    warehouseId: { type: mongoose_1.Schema.Types.Mixed, ref: 'Warehouse' },
    warehouseName: { type: String, default: '' },
    items: [{
            itemId: { type: mongoose_1.Schema.Types.Mixed },
            name: { type: String, required: true },
            sku: { type: String, default: '' },
            quantity: { type: Number, required: true, default: 1 },
            rate: { type: Number, default: 0 },
            condition: {
                type: String,
                enum: ['Restockable (Good)', 'Damaged / Scrap', 'Warranty Repair'],
                default: 'Restockable (Good)'
            },
            restockBin: { type: String, default: 'BIN-RESTOCK-01' }
        }],
    reason: { type: String, default: 'Customer Return' },
    condition: {
        type: String,
        enum: ['Restockable (Good)', 'Damaged / Scrap', 'Warranty Repair'],
        default: 'Restockable (Good)'
    },
    status: {
        type: String,
        enum: ['RMA Requested', 'RMA Approved', 'Received & Restocked', 'Credit Note Issued', 'Rejected'],
        default: 'RMA Approved'
    },
    returnDate: { type: Date, default: Date.now },
    creditNoteId: { type: mongoose_1.Schema.Types.Mixed, ref: 'CreditNote' },
    creditNoteNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
    receivedBy: { type: String, default: '' },
    receivedAt: { type: Date }
}, { timestamps: true, strict: false });
SalesReturnSchema.index({ orgId: 1, rmaNumber: 1 });
SalesReturnSchema.index({ orgId: 1, status: 1 });
const SalesReturnModel = mongoose_1.default.models.SalesReturn || mongoose_1.default.model('SalesReturn', SalesReturnSchema, 'sales_returns');
exports.default = SalesReturnModel;

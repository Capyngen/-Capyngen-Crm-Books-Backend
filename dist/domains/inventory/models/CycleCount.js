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
const CycleCountLineSchema = new mongoose_1.Schema({
    item: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    itemName: { type: String, default: '' },
    sku: { type: String, default: '' },
    bin: { type: String, default: '' },
    systemQuantity: { type: Number, required: true },
    countedQuantity: { type: Number, default: 0 },
    varianceQuantity: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    varianceValue: { type: Number, default: 0 },
    notes: { type: String, default: '' }
}, { _id: false });
const CycleCountSchema = new mongoose_1.Schema({
    companyId: { type: String, index: true },
    orgId: { type: String, index: true },
    countNumber: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    warehouseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksWarehouse', required: true },
    countType: {
        type: String,
        enum: ['Full', 'Class A', 'Class B', 'Class C', 'Spot Count', 'Custom'],
        default: 'Spot Count'
    },
    isBlindCount: { type: Boolean, default: true },
    status: {
        type: String,
        enum: ['Draft', 'In Progress', 'Under Review', 'Reconciled', 'Cancelled'],
        default: 'Draft'
    },
    assignedTo: { type: String, default: '' },
    countedBy: { type: String, default: '' },
    reconciledAt: { type: Date },
    reconciledBy: { type: String, default: '' },
    adjustmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksInventoryAdjustment' },
    lines: [CycleCountLineSchema],
    notes: { type: String, default: '' }
}, { timestamps: true });
CycleCountSchema.index({ companyId: 1, countNumber: 1 });
CycleCountSchema.index({ orgId: 1, countNumber: 1 });
exports.default = mongoose_1.default.models.BooksCycleCount || mongoose_1.default.model('BooksCycleCount', CycleCountSchema);

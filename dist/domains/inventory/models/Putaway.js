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
const PutawaySchema = new mongoose_1.Schema({
    companyId: { type: String, index: true },
    orgId: { type: String, index: true },
    putawayNumber: { type: String, required: true },
    grnNumber: { type: String, default: '' },
    purchaseReceive: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PurchaseReceive' },
    vendor: { type: mongoose_1.Schema.Types.Mixed },
    vendorName: { type: String, default: '' },
    item: { type: mongoose_1.Schema.Types.Mixed },
    itemName: { type: String, default: '' },
    itemSku: { type: String, default: '' },
    quantity: { type: Number, required: true, default: 1 },
    stagingDock: { type: String, default: 'Receiving Dock A' },
    targetBin: { type: String, required: true, default: 'Bin-A1' },
    batchNumber: { type: String, default: '' },
    serialNumbers: [{ type: String }],
    date: { type: Date, required: true, default: Date.now },
    status: {
        type: String,
        enum: ['Pending Putaway', 'Put Away Completed', 'Cancelled'],
        default: 'Pending Putaway'
    },
    completedAt: { type: Date },
    completedBy: { type: String },
    notes: { type: String, default: '' }
}, { timestamps: true });
PutawaySchema.index({ companyId: 1, putawayNumber: 1 });
PutawaySchema.index({ orgId: 1, status: 1 });
exports.default = mongoose_1.default.models.Putaway || mongoose_1.default.model('Putaway', PutawaySchema);

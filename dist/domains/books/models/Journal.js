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
exports.Journal = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const JournalLineItemSchema = new mongoose_1.Schema({
    account: { type: String, required: true },
    description: { type: String },
    contact: { type: String },
    debits: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    costCenter: { type: String },
    department: { type: String }
});
const JournalSchema = new mongoose_1.Schema({
    orgId: { type: String },
    date: { type: Date, required: true },
    reverseJournalDate: { type: Date },
    publishReverseOnlyOnDate: { type: Boolean, default: false },
    journalNumber: { type: String, required: true, unique: true },
    referenceNumber: { type: String },
    notes: { type: String, required: true },
    reportingMethod: { type: String, enum: ['accrual', 'cash', 'both'], required: true },
    currency: { type: String, default: 'INR' },
    lineItems: [JournalLineItemSchema],
    subTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Published', 'Void', 'Reversed'], default: 'Draft' },
    reversalOfId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Journal' },
    reversedById: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Journal' },
    reversalReason: { type: String }
}, { timestamps: true });
// Indexes for fast lookup of reversals
JournalSchema.index({ orgId: 1, date: -1 });
JournalSchema.index({ reversalOfId: 1 });
exports.Journal = mongoose_1.default.model('Journal', JournalSchema);

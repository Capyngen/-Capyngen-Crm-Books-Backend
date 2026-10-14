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
const VendorCreditSchema = new mongoose_1.Schema({
    currency: { type: String },
    exchangeRate: { type: Number },
    baseTotal: { type: Number },
    orgId: { type: String },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksVendor', required: true },
    vendorCreditNumber: { type: String, required: true },
    creditDate: { type: Date, required: true },
    referenceNumber: { type: String },
    billId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksBill' },
    lineItems: [{
            itemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksItem' },
            account: { type: String, required: true },
            quantity: { type: Number, required: true },
            rate: { type: Number, required: true },
            amount: { type: Number, required: true }
        }],
    subTotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Draft', 'Open', 'Closed', 'Void'], default: 'Open' },
    refunds: [{
            date: { type: Date, required: true },
            amount: { type: Number, required: true },
            reference: { type: String }
        }],
    appliedToBills: [{
            billId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BooksBill' },
            amountApplied: { type: Number, required: true }
        }]
}, { timestamps: true });
exports.default = mongoose_1.default.models.VendorCredit || mongoose_1.default.model('VendorCredit', VendorCreditSchema);

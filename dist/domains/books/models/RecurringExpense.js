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
const RecurringExpenseSchema = new mongoose_1.Schema({
    orgId: { type: String },
    profileName: { type: String, required: true },
    repeatEvery: { type: String, required: true },
    startsOn: { type: Date, required: true },
    endsOn: { type: Date },
    expenseAccount: { type: String, required: true },
    amount: { type: Number, required: true },
    paidThrough: { type: String, required: true },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor' },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ClientAccount' },
    billable: { type: Boolean, default: false },
    notes: { type: String },
    status: {
        type: String,
        enum: ['Active', 'Paused', 'Stopped', 'Expired'],
        default: 'Active'
    },
    currency: { type: String, default: 'INR' },
    createdBy: { type: String }
}, { timestamps: true });
const RecurringExpenseModel = mongoose_1.default.models.RecurringExpense || mongoose_1.default.model('RecurringExpense', RecurringExpenseSchema, 'recurringexpenses');
if (!mongoose_1.default.models.BooksRecurringExpense) {
    try {
        mongoose_1.default.model('BooksRecurringExpense', RecurringExpenseSchema, 'recurringexpenses');
    }
    catch (e) { }
}
exports.default = RecurringExpenseModel;

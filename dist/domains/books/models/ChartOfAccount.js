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
exports.ChartOfAccount = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ChartOfAccountSchema = new mongoose_1.Schema({
    orgId: { type: String, index: true },
    accountType: { type: String, required: true },
    accountGroup: { type: String },
    accountName: { type: String, required: true },
    accountCode: { type: String },
    description: { type: String, maxlength: 500 },
    addToWatchlist: { type: Boolean, default: false },
    isSubAccount: { type: Boolean, default: false },
    parentAccount: { type: String, ref: 'ChartOfAccount' },
    applicableBranches: [{ type: String }],
    costCenters: [{ type: String }],
    profitCenters: [{ type: String }],
    departments: [{ type: String }],
    effectiveDate: { type: Date },
    systemAccountType: { type: String, index: true },
    currency: { type: String },
    accountNumber: { type: String },
    ifsc: { type: String },
    users: [{ type: String }],
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    isSystemAccount: { type: Boolean, default: false }
}, { timestamps: true });
exports.ChartOfAccount = mongoose_1.default.model('ChartOfAccount', ChartOfAccountSchema);

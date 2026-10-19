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
exports.LeaveBalance = exports.LeaveApplication = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const LeaveApplicationSchema = new mongoose_1.Schema({
    orgId: { type: String, required: true, index: true },
    companyId: { type: String, index: true },
    employeeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    employeeName: { type: String },
    employeeCode: { type: String },
    leaveType: {
        type: String,
        enum: ['Paid Leave', 'Casual Leave', 'Sick Leave', 'Maternity Leave', 'Paternity Leave', 'Compensatory Off', 'Loss of Pay'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    approvedBy: { type: String },
    approvalDate: { type: Date },
    rejectionReason: { type: String }
}, { timestamps: true });
const LeaveBalanceSchema = new mongoose_1.Schema({
    orgId: { type: String, required: true, index: true },
    companyId: { type: String, index: true },
    employeeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    year: { type: Number, required: true },
    paidLeave: {
        allocated: { type: Number, default: 18 },
        used: { type: Number, default: 0 },
        balance: { type: Number, default: 18 }
    },
    casualLeave: {
        allocated: { type: Number, default: 12 },
        used: { type: Number, default: 0 },
        balance: { type: Number, default: 12 }
    },
    sickLeave: {
        allocated: { type: Number, default: 12 },
        used: { type: Number, default: 0 },
        balance: { type: Number, default: 12 }
    },
    lossOfPay: {
        used: { type: Number, default: 0 }
    }
}, { timestamps: true });
LeaveBalanceSchema.index({ orgId: 1, employeeId: 1, year: 1 }, { unique: true });
exports.LeaveApplication = mongoose_1.default.models.LeaveApplication || mongoose_1.default.model('LeaveApplication', LeaveApplicationSchema);
exports.LeaveBalance = mongoose_1.default.models.LeaveBalance || mongoose_1.default.model('LeaveBalance', LeaveBalanceSchema);

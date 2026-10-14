"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const Plan_1 = __importDefault(require("../models/Plan"));
const Customer_1 = __importDefault(require("../models/Customer"));
const getDashboardData = async (req, res) => {
    try {
        const plans = await Plan_1.default.find().lean();
        const customers = await Customer_1.default.find().lean();
        let mrr = 0;
        plans.forEach(p => {
            if (p.status === 'Active' && p.price) {
                mrr += p.price; // Approximation for demo
            }
        });
        res.json({
            success: true,
            data: {
                netRevenue: mrr * 12,
                mrr,
                activeSubscriptions: plans.length,
                arpu: plans.length ? (mrr / plans.length) : 0,
                churnRate: 0,
                activeCustomers: customers.length
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getDashboardData = getDashboardData;

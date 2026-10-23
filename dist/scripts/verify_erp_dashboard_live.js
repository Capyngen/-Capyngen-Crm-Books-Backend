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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const dashboardController_1 = require("../domains/books/controllers/dashboardController");
dotenv_1.default.config();
async function verify() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB Atlas...');
    const spinnyId = '6aa797278d301b4735f1d322';
    // Mock Request & Response for getInventoryDashboardData
    const mockReq = {
        org: { _id: spinnyId },
        headers: {}
    };
    let inventoryDashboardOutput = null;
    const mockRes = {
        json: (payload) => {
            inventoryDashboardOutput = payload;
        },
        status: (code) => ({
            json: (payload) => {
                inventoryDashboardOutput = { statusCode: code, ...payload };
            }
        })
    };
    console.log('\n--- Testing getInventoryDashboardData for Spinny ---');
    await (0, dashboardController_1.getInventoryDashboardData)(mockReq, mockRes);
    console.log('Inventory Dashboard Response:');
    console.log(JSON.stringify(inventoryDashboardOutput, null, 2));
    // Mock Request & Response for Books getDashboardData
    let booksDashboardOutput = null;
    const mockBooksRes = {
        json: (payload) => {
            booksDashboardOutput = payload;
        },
        status: (code) => ({
            json: (payload) => {
                booksDashboardOutput = { statusCode: code, ...payload };
            }
        })
    };
    console.log('\n--- Testing Books getDashboardData for Spinny ---');
    await (0, dashboardController_1.getDashboardData)(mockReq, mockBooksRes);
    console.log('Books Dashboard Key Metrics:');
    if (booksDashboardOutput?.data) {
        const d = booksDashboardOutput.data;
        console.log({
            totalReceivables: d.totalReceivables,
            totalPayables: d.totalPayables,
            totalIncome: d.totalIncome,
            totalExpense: d.totalExpense,
            netProfit: d.netProfit,
            recentActivityCount: d.recentActivity?.length
        });
    }
    // Mock Request & Response for Billing getDashboardData
    const { getDashboardData: getBillingDashboardData } = await Promise.resolve().then(() => __importStar(require('../domains/billing/controllers/dashboardController')));
    let billingDashboardOutput = null;
    const mockBillingRes = {
        json: (payload) => {
            billingDashboardOutput = payload;
        },
        status: (code) => ({
            json: (payload) => {
                billingDashboardOutput = { statusCode: code, ...payload };
            }
        })
    };
    console.log('\n--- Testing Billing getDashboardData for Spinny ---');
    await getBillingDashboardData(mockReq, mockBillingRes);
    console.log('Billing Dashboard Key Metrics:');
    if (billingDashboardOutput?.data) {
        const bd = billingDashboardOutput.data;
        console.log({
            netRevenue: bd.netRevenue,
            mrr: bd.mrr,
            activeCustomers: bd.activeCustomers,
            recentCustomersCount: bd.recentCustomers?.length,
            recentEventsCount: bd.recentEvents?.length
        });
    }
    await mongoose_1.default.disconnect();
}
verify().catch((e) => {
    console.error('Verification error:', e);
    process.exit(1);
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgetVariance = exports.saveBudgetLines = exports.getScenarioDetails = exports.createScenario = exports.getScenarios = void 0;
const BudgetScenario_1 = require("../models/BudgetScenario");
const BudgetLine_1 = __importDefault(require("../models/BudgetLine"));
const LedgerEntry_1 = __importDefault(require("../models/LedgerEntry"));
const mongoose_1 = __importDefault(require("mongoose"));
const getScenarios = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'] || 'mock-org-id';
        const scenarios = await BudgetScenario_1.BudgetScenario.find({ orgId }).populate('fiscalYearId').sort({ createdAt: -1 });
        res.json(scenarios);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getScenarios = getScenarios;
const createScenario = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const { name, fiscalYearId, type, periodType, description } = req.body;
        const scenario = new BudgetScenario_1.BudgetScenario({ orgId, name, fiscalYearId, type, periodType, description, status: 'Active' });
        await scenario.save();
        res.status(201).json(scenario);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.createScenario = createScenario;
const getScenarioDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const scenario = await BudgetScenario_1.BudgetScenario.findById(id).populate('fiscalYearId');
        const lines = await BudgetLine_1.default.find({ scenarioId: id }).populate('accountId');
        res.json({ scenario, lines });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getScenarioDetails = getScenarioDetails;
const saveBudgetLines = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const { id } = req.params; // scenarioId
        const { lines } = req.body; // Array of { accountId, totalAmount, periods: [] }
        await BudgetLine_1.default.deleteMany({ scenarioId: id });
        let total = 0;
        const budgetLinesToInsert = lines.map((l) => {
            total += Number(l.totalAmount);
            return {
                orgId,
                scenarioId: id,
                accountId: l.accountId,
                totalAmount: l.totalAmount,
                periods: l.periods
            };
        });
        if (budgetLinesToInsert.length > 0) {
            await BudgetLine_1.default.insertMany(budgetLinesToInsert);
        }
        await BudgetScenario_1.BudgetScenario.findByIdAndUpdate(id, { totalBudgetedAmount: total });
        res.json({ message: 'Budget saved successfully', totalBudgetedAmount: total });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.saveBudgetLines = saveBudgetLines;
// Compare actuals vs budget for variance alerts
const getBudgetVariance = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const { id } = req.params; // scenarioId
        const lines = await BudgetLine_1.default.find({ scenarioId: id }).populate('accountId');
        // For a real ERP, we query the LedgerEntry for each account in the budget
        // and sum up actual spending for the fiscal year period.
        const varianceData = await Promise.all(lines.map(async (line) => {
            // Aggregate actuals from Ledger (simulated here with a quick query or random logic if ledger empty)
            // In production, we filter by date range of the fiscal year
            const actualsAgg = await LedgerEntry_1.default.aggregate([
                { $match: { orgId, accountId: new mongoose_1.default.Types.ObjectId(line.accountId._id.toString()) } },
                { $group: { _id: null, totalDebit: { $sum: '$debit' }, totalCredit: { $sum: '$credit' } } }
            ]);
            const actualAmount = actualsAgg.length > 0 ? (actualsAgg[0].totalDebit - actualsAgg[0].totalCredit) : 0; // Simplified for expense
            return {
                accountId: line.accountId._id,
                accountName: line.accountId.accountName,
                budgeted: line.totalAmount,
                actual: actualAmount,
                variance: line.totalAmount - actualAmount,
                variancePercentage: line.totalAmount > 0 ? ((line.totalAmount - actualAmount) / line.totalAmount) * 100 : 0
            };
        }));
        res.json(varianceData);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getBudgetVariance = getBudgetVariance;

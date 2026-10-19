"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBudgetThreshold = exports.getBudgetVariance = exports.saveBudgetLines = exports.getScenarioDetails = exports.createScenario = exports.getScenarios = void 0;
const BudgetScenario_1 = require("../models/BudgetScenario");
const BudgetLine_1 = __importDefault(require("../models/BudgetLine"));
const LedgerEntry_1 = __importDefault(require("../models/LedgerEntry"));
const mongoose_1 = __importDefault(require("mongoose"));
const getOrgId = (req) => {
    return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};
const getScenarios = async (req, res) => {
    try {
        const orgId = getOrgId(req);
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
        const orgId = getOrgId(req);
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
        const orgId = getOrgId(req);
        const { id } = req.params; // scenarioId
        const { lines } = req.body; // Array of { accountId, totalAmount, periods: [] }
        await BudgetLine_1.default.deleteMany({ scenarioId: id });
        let total = 0;
        const budgetLinesToInsert = lines.map((l) => {
            total += Number(l.totalAmount) || 0;
            return {
                orgId,
                scenarioId: id,
                accountId: l.accountId,
                totalAmount: Number(l.totalAmount) || 0,
                periods: l.periods || []
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
// Compare actuals vs budget for variance alerts with corrected nested LedgerEntry aggregation
const getBudgetVariance = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { id } = req.params; // scenarioId
        const lines = await BudgetLine_1.default.find({ scenarioId: id }).populate('accountId');
        const varianceData = await Promise.all(lines.map(async (line) => {
            const account = line.accountId;
            if (!account)
                return null;
            const accountIdStr = account._id.toString();
            const accountObjId = account._id;
            // Aggregates actuals from LedgerEntry nested lines
            const actualsAgg = await LedgerEntry_1.default.aggregate([
                {
                    $match: {
                        orgId,
                        status: 'Posted',
                        'lines.accountId': { $in: [accountIdStr, accountObjId] }
                    }
                },
                { $unwind: '$lines' },
                {
                    $match: {
                        'lines.accountId': { $in: [accountIdStr, accountObjId] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalDebit: { $sum: '$lines.debit' },
                        totalCredit: { $sum: '$lines.credit' }
                    }
                }
            ]);
            const totalDebit = actualsAgg.length > 0 ? actualsAgg[0].totalDebit : 0;
            const totalCredit = actualsAgg.length > 0 ? actualsAgg[0].totalCredit : 0;
            // For Expense accounts, actual = Debit - Credit. For Income, actual = Credit - Debit.
            const isIncome = account.accountCategory === 'Income' || account.accountType?.includes('Revenue');
            const actualAmount = isIncome ? (totalCredit - totalDebit) : (totalDebit - totalCredit);
            const budgeted = line.totalAmount || 0;
            const variance = budgeted - actualAmount;
            const variancePercentage = budgeted > 0 ? ((budgeted - actualAmount) / budgeted) * 100 : 0;
            const utilization = budgeted > 0 ? (actualAmount / budgeted) * 100 : 0;
            let alertStatus = 'Normal';
            if (utilization >= 100)
                alertStatus = 'Exceeded';
            else if (utilization >= 80)
                alertStatus = 'Warning';
            return {
                accountId: account._id,
                accountName: account.accountName,
                accountCategory: account.accountCategory || (isIncome ? 'Income' : 'Expense'),
                budgeted,
                actual: actualAmount,
                variance,
                variancePercentage: Math.round(variancePercentage * 10) / 10,
                utilization: Math.round(utilization * 10) / 10,
                alertStatus
            };
        }));
        res.json(varianceData.filter(Boolean));
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getBudgetVariance = getBudgetVariance;
// Check if a prospective transaction exceeds the budget
const checkBudgetThreshold = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { accountId, amount = 0 } = req.body;
        if (!accountId)
            return res.status(400).json({ message: 'accountId is required' });
        // Find active budget line for this account
        const budgetLine = await BudgetLine_1.default.findOne({ orgId, accountId }).populate('scenarioId');
        if (!budgetLine) {
            return res.json({
                hasBudget: false,
                allowed: true,
                message: 'No active budget constraint on this account'
            });
        }
        const accountIdStr = accountId.toString();
        let accountObjId = null;
        try {
            accountObjId = new mongoose_1.default.Types.ObjectId(accountId);
        }
        catch (e) { }
        const matchIds = accountObjId ? [accountIdStr, accountObjId] : [accountIdStr];
        const actualsAgg = await LedgerEntry_1.default.aggregate([
            { $match: { orgId, status: 'Posted', 'lines.accountId': { $in: matchIds } } },
            { $unwind: '$lines' },
            { $match: { 'lines.accountId': { $in: matchIds } } },
            { $group: { _id: null, totalDebit: { $sum: '$lines.debit' }, totalCredit: { $sum: '$lines.credit' } } }
        ]);
        const totalDebit = actualsAgg.length > 0 ? actualsAgg[0].totalDebit : 0;
        const totalCredit = actualsAgg.length > 0 ? actualsAgg[0].totalCredit : 0;
        const currentActual = totalDebit - totalCredit;
        const budgeted = budgetLine.totalAmount;
        const projectedTotal = currentActual + Number(amount);
        const projectedUtilization = budgeted > 0 ? (projectedTotal / budgeted) * 100 : 0;
        let alertStatus = 'Normal';
        if (projectedUtilization > 100)
            alertStatus = 'Exceeded';
        else if (projectedUtilization >= 80)
            alertStatus = 'Warning';
        res.json({
            hasBudget: true,
            budgeted,
            currentActual,
            additionalAmount: Number(amount),
            projectedTotal,
            projectedUtilization: Math.round(projectedUtilization * 10) / 10,
            alertStatus,
            allowed: projectedUtilization <= 100
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.checkBudgetThreshold = checkBudgetThreshold;

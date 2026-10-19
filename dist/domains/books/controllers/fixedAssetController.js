"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetSchedule = exports.disposeAsset = exports.runDepreciation = exports.createAsset = exports.getAssets = exports.createCategory = exports.getCategories = void 0;
const FixedAsset_1 = require("../models/FixedAsset");
const AssetCategory_1 = require("../models/AssetCategory");
const Journal_1 = require("../models/Journal");
const ChartOfAccount_1 = require("../models/ChartOfAccount");
const BankAccount_1 = __importDefault(require("../models/BankAccount"));
const ledgerService_1 = require("../services/ledgerService");
const mongoose_1 = __importDefault(require("mongoose"));
const getOrgId = (req) => {
    return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};
const getCategories = async (req, res) => {
    try {
        let orgId = getOrgId(req);
        let categories = await AssetCategory_1.AssetCategory.find({ orgId });
        if (categories.length === 0) {
            // Auto-seed default asset categories if none exist
            let assetAccount = await ChartOfAccount_1.ChartOfAccount.findOne({ orgId, accountType: 'FixedAsset' });
            if (!assetAccount) {
                assetAccount = await ChartOfAccount_1.ChartOfAccount.findOne({ orgId });
            }
            const defaultAccountId = assetAccount ? assetAccount._id : new mongoose_1.default.Types.ObjectId();
            const cat = new AssetCategory_1.AssetCategory({
                orgId,
                name: 'Computers & Equipment',
                depreciationMethod: 'Straight_Line',
                defaultUsefulLifeMonths: 36,
                assetAccountId: defaultAccountId,
                depreciationAccountId: defaultAccountId,
                accumulatedDepreciationAccountId: defaultAccountId
            });
            await cat.save();
            categories = [cat];
        }
        res.json(categories);
    }
    catch (e) {
        res.status(500).json({ message: e.message || 'Error fetching asset categories' });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { name, depreciationMethod, defaultUsefulLifeMonths, assetAccountId, depreciationAccountId, accumulatedDepreciationAccountId } = req.body;
        const category = new AssetCategory_1.AssetCategory({
            orgId,
            name,
            depreciationMethod: depreciationMethod || 'Straight_Line',
            defaultUsefulLifeMonths: Number(defaultUsefulLifeMonths) || 36,
            assetAccountId,
            depreciationAccountId,
            accumulatedDepreciationAccountId
        });
        await category.save();
        res.status(201).json(category);
    }
    catch (err) {
        res.status(400).json({ message: err.message || 'Error creating asset category' });
    }
};
exports.createCategory = createCategory;
const getAssets = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const assets = await FixedAsset_1.FixedAsset.find({ orgId }).populate('categoryId').sort({ createdAt: -1 });
        res.json(assets);
    }
    catch (err) {
        res.status(500).json({ message: err.message || 'Error fetching assets' });
    }
};
exports.getAssets = getAssets;
const createAsset = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { assetName, categoryId, purchaseDate, purchasePrice, salvageValue = 0, usefulLifeMonths, depreciationMethod, vendorId, billId } = req.body;
        const count = await FixedAsset_1.FixedAsset.countDocuments({ orgId });
        const assetNumber = `AST-${String(count + 1).padStart(4, '0')}`;
        const numPrice = Number(purchasePrice) || 0;
        const numSalvage = Number(salvageValue) || 0;
        const numMonths = Number(usefulLifeMonths) || 36;
        const asset = new FixedAsset_1.FixedAsset({
            orgId,
            assetName,
            assetNumber,
            categoryId,
            purchaseDate: new Date(purchaseDate || Date.now()),
            purchasePrice: numPrice,
            salvageValue: numSalvage,
            usefulLifeMonths: numMonths,
            depreciationMethod: depreciationMethod || 'Straight_Line',
            currentBookValue: numPrice,
            accumulatedDepreciation: 0,
            status: 'Active'
        });
        await asset.save();
        res.status(201).json(asset);
    }
    catch (err) {
        res.status(400).json({ message: err.message || 'Error creating asset' });
    }
};
exports.createAsset = createAsset;
const runDepreciation = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { runDate } = req.body;
        const targetDate = new Date(runDate || Date.now());
        const activeAssets = await FixedAsset_1.FixedAsset.find({ orgId, status: 'Active' }).populate('categoryId');
        let processedCount = 0;
        let totalDepreciationPosted = 0;
        for (const asset of activeAssets) {
            const category = asset.categoryId;
            if (!category)
                continue;
            if (asset.currentBookValue <= asset.salvageValue)
                continue;
            let monthlyDepreciation = 0;
            if (asset.depreciationMethod === 'Straight_Line') {
                const totalDepreciableAmount = asset.purchasePrice - asset.salvageValue;
                monthlyDepreciation = totalDepreciableAmount / (asset.usefulLifeMonths || 36);
            }
            else if (asset.depreciationMethod === 'Declining_Balance') {
                const rate = (1 / ((asset.usefulLifeMonths || 36) / 12)) * 2;
                const annualDepr = asset.currentBookValue * rate;
                monthlyDepreciation = annualDepr / 12;
            }
            // Do not depreciate below salvage value
            if (asset.currentBookValue - monthlyDepreciation < asset.salvageValue) {
                monthlyDepreciation = asset.currentBookValue - asset.salvageValue;
            }
            monthlyDepreciation = Math.round(monthlyDepreciation * 100) / 100;
            if (monthlyDepreciation > 0) {
                const deprAccountId = category.depreciationAccountId ? category.depreciationAccountId.toString() : 'Depreciation Expense';
                const accumAccountId = category.accumulatedDepreciationAccountId ? category.accumulatedDepreciationAccountId.toString() : 'Accumulated Depreciation';
                // 1. Create and Save Balanced System Journal
                const journal = new Journal_1.Journal({
                    orgId,
                    date: targetDate,
                    journalNumber: `DEPR-${asset.assetNumber}-${targetDate.getTime().toString().slice(-6)}`,
                    referenceNumber: `Depreciation: ${asset.assetName}`,
                    notes: `Monthly depreciation run for asset ${asset.assetNumber} (${asset.assetName})`,
                    reportingMethod: 'accrual',
                    subTotal: monthlyDepreciation,
                    total: monthlyDepreciation,
                    status: 'Published',
                    lineItems: [
                        {
                            account: deprAccountId,
                            description: `Depreciation Expense - ${asset.assetName}`,
                            debits: monthlyDepreciation,
                            credits: 0
                        },
                        {
                            account: accumAccountId,
                            description: `Accumulated Depreciation - ${asset.assetName}`,
                            debits: 0,
                            credits: monthlyDepreciation
                        }
                    ]
                });
                await journal.save();
                // 2. Post to General Ledger
                await ledgerService_1.LedgerService.postTransaction(orgId, journal._id.toString(), 'Fixed Asset Depreciation', targetDate, [
                    { accountId: deprAccountId, debit: monthlyDepreciation, credit: 0 },
                    { accountId: accumAccountId, debit: 0, credit: monthlyDepreciation }
                ]);
                // 3. Update Asset
                asset.accumulatedDepreciation += monthlyDepreciation;
                asset.currentBookValue -= monthlyDepreciation;
                asset.depreciationHistory.push({
                    date: targetDate,
                    amount: monthlyDepreciation,
                    journalId: journal._id
                });
                if (asset.currentBookValue <= asset.salvageValue) {
                    asset.status = 'Fully_Depreciated';
                }
                await asset.save();
                processedCount++;
                totalDepreciationPosted += monthlyDepreciation;
            }
        }
        res.json({
            success: true,
            message: `Depreciation run successful. Processed ${processedCount} assets.`,
            processedCount,
            totalDepreciationPosted
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message || 'Error running depreciation' });
    }
};
exports.runDepreciation = runDepreciation;
const disposeAsset = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const { id } = req.params;
        const { disposalDate, saleProceeds = 0, bankAccountId, disposalReason = 'Sale' } = req.body;
        const asset = await FixedAsset_1.FixedAsset.findOne({ _id: id, orgId }).populate('categoryId');
        if (!asset)
            return res.status(404).json({ message: 'Asset not found' });
        if (asset.status === 'Disposed')
            return res.status(400).json({ message: 'Asset is already disposed' });
        const category = asset.categoryId;
        const proceeds = Number(saleProceeds) || 0;
        const originalCost = asset.purchasePrice;
        const accumulatedDepr = asset.accumulatedDepreciation;
        const netBookValue = asset.currentBookValue;
        const gainOrLoss = proceeds - netBookValue; // Positive = Gain, Negative = Loss
        const date = new Date(disposalDate || Date.now());
        // Resolve GL accounts
        const assetCoaId = category?.assetAccountId?.toString() || 'Fixed Asset Cost';
        const accumCoaId = category?.accumulatedDepreciationAccountId?.toString() || 'Accumulated Depreciation';
        let bankCoaId = 'Cash / Bank';
        if (bankAccountId) {
            const bankAcc = await BankAccount_1.default.findById(bankAccountId);
            if (bankAcc?.chartOfAccountId)
                bankCoaId = bankAcc.chartOfAccountId.toString();
        }
        // Gain or loss GL Account
        let gainLossAccount = await ChartOfAccount_1.ChartOfAccount.findOne({
            orgId,
            accountName: { $regex: /Gain.*Loss.*Asset|Disposal of Fixed Assets/i }
        });
        if (!gainLossAccount) {
            gainLossAccount = await ChartOfAccount_1.ChartOfAccount.findOne({ orgId, accountCategory: 'Income' });
        }
        const gainLossCoaId = gainLossAccount ? gainLossAccount._id.toString() : 'Gain/Loss on Asset Disposal';
        const lineItems = [];
        const ledgerLines = [];
        // 1. Debit Bank/Cash if proceeds > 0
        if (proceeds > 0) {
            lineItems.push({ account: bankCoaId, debits: proceeds, credits: 0, description: `Proceeds from disposal of ${asset.assetName}` });
            ledgerLines.push({ accountId: bankCoaId, debit: proceeds, credit: 0 });
        }
        // 2. Debit Accumulated Depreciation to write it off
        if (accumulatedDepr > 0) {
            lineItems.push({ account: accumCoaId, debits: accumulatedDepr, credits: 0, description: `Write off accumulated depr for ${asset.assetName}` });
            ledgerLines.push({ accountId: accumCoaId, debit: accumulatedDepr, credit: 0 });
        }
        // 3. Credit Fixed Asset Cost to remove original cost
        lineItems.push({ account: assetCoaId, debits: 0, credits: originalCost, description: `Write off original asset cost for ${asset.assetName}` });
        ledgerLines.push({ accountId: assetCoaId, debit: 0, credit: originalCost });
        // 4. Balancing Gain or Loss
        if (gainOrLoss > 0) {
            // Gain: Credit Gain account
            lineItems.push({ account: gainLossCoaId, debits: 0, credits: gainOrLoss, description: `Gain on sale of ${asset.assetName}` });
            ledgerLines.push({ accountId: gainLossCoaId, debit: 0, credit: gainOrLoss });
        }
        else if (gainOrLoss < 0) {
            // Loss: Debit Loss account
            const lossAbs = Math.abs(gainOrLoss);
            lineItems.push({ account: gainLossCoaId, debits: lossAbs, credits: 0, description: `Loss on disposal of ${asset.assetName}` });
            ledgerLines.push({ accountId: gainLossCoaId, debit: lossAbs, credit: 0 });
        }
        const journal = new Journal_1.Journal({
            orgId,
            date,
            journalNumber: `DISP-${asset.assetNumber}-${Date.now().toString().slice(-4)}`,
            referenceNumber: `Disposal: ${asset.assetName}`,
            notes: `Asset disposal: ${disposalReason}. Net book value: ${netBookValue}, Proceeds: ${proceeds}`,
            reportingMethod: 'accrual',
            currency: 'INR',
            lineItems,
            subTotal: originalCost,
            total: originalCost,
            status: 'Published'
        });
        await journal.save();
        await ledgerService_1.LedgerService.postTransaction(orgId, journal._id.toString(), 'Fixed Asset Depreciation', date, ledgerLines);
        asset.status = 'Disposed';
        asset.currentBookValue = 0;
        await asset.save();
        res.json({
            success: true,
            message: `Asset ${asset.assetNumber} successfully disposed`,
            disposalDetails: {
                originalCost,
                accumulatedDepr,
                netBookValue,
                saleProceeds: proceeds,
                gainOrLoss
            },
            journal
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message || 'Error disposing asset' });
    }
};
exports.disposeAsset = disposeAsset;
const getAssetSchedule = async (req, res) => {
    try {
        const orgId = getOrgId(req);
        const assets = await FixedAsset_1.FixedAsset.find({ orgId }).populate('categoryId').lean();
        let totalGrossBlock = 0;
        let totalDepreciation = 0;
        let totalNetBookValue = 0;
        const schedule = assets.map(a => {
            totalGrossBlock += a.purchasePrice;
            totalDepreciation += a.accumulatedDepreciation;
            totalNetBookValue += a.currentBookValue;
            return {
                _id: a._id,
                assetNumber: a.assetNumber,
                assetName: a.assetName,
                category: a.categoryId?.name || 'General',
                purchaseDate: a.purchaseDate,
                purchasePrice: a.purchasePrice,
                accumulatedDepreciation: a.accumulatedDepreciation,
                currentBookValue: a.currentBookValue,
                salvageValue: a.salvageValue,
                status: a.status
            };
        });
        res.json({
            summary: {
                totalGrossBlock,
                totalDepreciation,
                totalNetBookValue,
                assetCount: assets.length
            },
            schedule
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message || 'Error generating asset schedule' });
    }
};
exports.getAssetSchedule = getAssetSchedule;

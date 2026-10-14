"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDepreciation = exports.createAsset = exports.getAssets = exports.getCategories = void 0;
const FixedAsset_1 = require("../models/FixedAsset");
const AssetCategory_1 = require("../models/AssetCategory");
const Journal_1 = require("../models/Journal");
const ChartOfAccount_1 = require("../models/ChartOfAccount");
const mongoose_1 = __importDefault(require("mongoose"));
const getCategories = async (req, res) => {
    try {
        let orgId = req.org?._id || req.headers['x-org-id'];
        if (!orgId) {
            const firstCompany = await mongoose_1.default.connection.collection('companyprofiles').findOne();
            if (firstCompany)
                orgId = firstCompany._id.toString();
        }
        let categories = await AssetCategory_1.AssetCategory.find({ orgId });
        if (categories.length === 0) {
            // Auto-seed for demo
            // Find a real account to avoid any validation errors
            let account = await ChartOfAccount_1.ChartOfAccount.findOne({ orgId });
            if (!account) {
                account = await ChartOfAccount_1.ChartOfAccount.findOne();
            }
            const cat = new AssetCategory_1.AssetCategory({
                orgId,
                name: 'Computers & Equipment',
                depreciationMethod: 'Straight_Line',
                defaultUsefulLifeMonths: 36,
                assetAccountId: account ? account._id : new mongoose_1.default.Types.ObjectId(),
                depreciationAccountId: account ? account._id : new mongoose_1.default.Types.ObjectId(),
                accumulatedDepreciationAccountId: account ? account._id : new mongoose_1.default.Types.ObjectId()
            });
            await cat.save();
            categories = [cat];
        }
        res.json(categories);
    }
    catch (e) {
        console.error('ERROR SEEDING CATEGORY:', e);
        res.status(500).json({ message: e.message });
    }
};
exports.getCategories = getCategories;
const getAssets = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const assets = await FixedAsset_1.FixedAsset.find({ orgId }).populate('categoryId').sort({ createdAt: -1 });
        res.json(assets);
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching assets' });
    }
};
exports.getAssets = getAssets;
const createAsset = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const { assetName, categoryId, purchaseDate, purchasePrice, salvageValue, usefulLifeMonths, depreciationMethod } = req.body;
        // Auto-generate Asset Number
        const count = await FixedAsset_1.FixedAsset.countDocuments({ orgId });
        const assetNumber = `AST-${String(count + 1).padStart(4, '0')}`;
        const asset = new FixedAsset_1.FixedAsset({
            orgId,
            assetName,
            assetNumber,
            categoryId,
            purchaseDate,
            purchasePrice,
            salvageValue,
            usefulLifeMonths,
            depreciationMethod,
            currentBookValue: purchasePrice, // Initially, book value is purchase price
            accumulatedDepreciation: 0,
            status: 'Active'
        });
        await asset.save();
        res.status(201).json(asset);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.createAsset = createAsset;
const runDepreciation = async (req, res) => {
    try {
        const orgId = req.org?._id || req.headers['x-org-id'];
        const { runDate } = req.body; // usually end of month e.g., '2026-10-31'
        const targetDate = new Date(runDate);
        const activeAssets = await FixedAsset_1.FixedAsset.find({ orgId, status: 'Active' }).populate('categoryId');
        let processedCount = 0;
        for (const asset of activeAssets) {
            const category = asset.categoryId;
            if (!category)
                continue;
            if (asset.currentBookValue <= asset.salvageValue)
                continue; // Already fully depreciated
            let monthlyDepreciation = 0;
            if (asset.depreciationMethod === 'Straight_Line') {
                const totalDepreciableAmount = asset.purchasePrice - asset.salvageValue;
                monthlyDepreciation = totalDepreciableAmount / asset.usefulLifeMonths;
            }
            else if (asset.depreciationMethod === 'Declining_Balance') {
                const rate = asset.depreciationRate || (1 / (asset.usefulLifeMonths / 12)) * 2; // Double declining
                const annualDepr = asset.currentBookValue * rate;
                monthlyDepreciation = annualDepr / 12;
            }
            // Ensure we don't depreciate below salvage value
            if (asset.currentBookValue - monthlyDepreciation < asset.salvageValue) {
                monthlyDepreciation = asset.currentBookValue - asset.salvageValue;
            }
            if (monthlyDepreciation > 0) {
                // 1. Create System Journal
                const journal = new Journal_1.Journal({
                    orgId,
                    date: targetDate,
                    journalNumber: `DEPR-${asset.assetNumber}-${targetDate.getTime()}`,
                    reference: `Depreciation for ${asset.assetName}`,
                    notes: `System generated depreciation run for ${asset.assetNumber}`,
                    status: 'Published',
                    lines: [
                        {
                            accountId: category.depreciationAccountId,
                            description: `Depreciation Expense - ${asset.assetName}`,
                            debit: monthlyDepreciation,
                            credit: 0
                        },
                        {
                            accountId: category.accumulatedDepreciationAccountId,
                            description: `Accumulated Depreciation - ${asset.assetName}`,
                            debit: 0,
                            credit: monthlyDepreciation
                        }
                    ]
                });
                await journal.save();
                // 2. Update Asset
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
            }
        }
        res.json({ message: `Depreciation run successful. Processed ${processedCount} assets.` });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.runDepreciation = runDepreciation;

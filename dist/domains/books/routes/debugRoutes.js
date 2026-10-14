"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const AssetCategory_1 = require("../models/AssetCategory");
const ChartOfAccount_1 = require("../models/ChartOfAccount");
const mongoose_1 = __importDefault(require("mongoose"));
// Public debug route
router.get('/debug-categories', async (req, res) => {
    try {
        const firstCompany = await mongoose_1.default.connection.collection('companyprofiles').findOne();
        const orgId = firstCompany ? firstCompany._id.toString() : 'mock-org-id';
        let categories = await AssetCategory_1.AssetCategory.find({ orgId });
        if (categories.length === 0) {
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
        res.json({ success: true, categories });
    }
    catch (e) {
        res.json({ success: false, error: e.message, stack: e.stack });
    }
});
exports.default = router;

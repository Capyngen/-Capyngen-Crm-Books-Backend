const express = require('express');
const router = express.Router();
import { AssetCategory } from '../models/AssetCategory';
import { ChartOfAccount } from '../models/ChartOfAccount';
import mongoose from 'mongoose';

// Public debug route
router.get('/debug-categories', async (req, res) => {
  try {
    const firstCompany = await mongoose.connection.collection('companyprofiles').findOne();
    const orgId = firstCompany ? firstCompany._id.toString() : 'mock-org-id';
    
    let categories = await AssetCategory.find({ orgId });
    if (categories.length === 0) {
      let account = await ChartOfAccount.findOne({ orgId });
      if (!account) {
        account = await ChartOfAccount.findOne();
      }

      const cat = new AssetCategory({
        orgId,
        name: 'Computers & Equipment',
        depreciationMethod: 'Straight_Line',
        defaultUsefulLifeMonths: 36,
        assetAccountId: account ? account._id : new mongoose.Types.ObjectId(),
        depreciationAccountId: account ? account._id : new mongoose.Types.ObjectId(),
        accumulatedDepreciationAccountId: account ? account._id : new mongoose.Types.ObjectId()
      });
      await cat.save();
      categories = [cat];
    }
    res.json({ success: true, categories });
  } catch (e) {
    res.json({ success: false, error: e.message, stack: e.stack });
  }
});

export default router;

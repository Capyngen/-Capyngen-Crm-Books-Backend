import Vendor from '../../inventory/models/Vendor';
import express from 'express';
import { FiscalYear } from '../models/FiscalYear';

const router = express.Router();

router.get('/test-fiscal', async (req, res) => {
  try {
    const orgId = "6aa797278d301b4735f1d322"; // Hardcode Spinny's orgId
    const years = await FiscalYear.find({ orgId });
    res.json({ count: years.length, years });
  } catch (e) {
    res.json({ error: e.message });
  }
});


router.get('/fix-vendors', async (req, res) => {
    try {
        const orgId = '6aa797278d301b4735f1d322';
        const result = await Vendor.updateMany(
            {},
            { $set: { orgId: orgId, companyId: orgId } }
        );
        res.json({ success: true, message: 'Updated', modified: result.modifiedCount });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;

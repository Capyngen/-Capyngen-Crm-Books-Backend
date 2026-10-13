import express from 'express';
import { verifyCapyngenToken } from '../../../core/middlewares/hrmsAuth';
import { FiscalYear } from '../models/FiscalYear';

const router = express.Router();

router.get('/whoami', verifyCapyngenToken, async (req: any, res: any) => {
  try {
    let orgIdRaw = req.org?._id || req.headers['x-org-id']; 
    let orgId = orgIdRaw ? String(orgIdRaw) : undefined;
    
    const count = await FiscalYear.countDocuments({ orgId });
    const allCount = await FiscalYear.countDocuments({});
    
    res.json({
      reqOrg: req.org,
      headers: req.headers,
      resolvedOrgId: orgId,
      myFiscalCount: count,
      totalFiscalCount: allCount
    });
  } catch (e: any) {
    res.json({ error: e.message });
  }
});

export default router;

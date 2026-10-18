import express from 'express';
import {
  getGSTR1,
  getGSTR2B,
  getGSTR3B,
  getTdsReturn
} from '../controllers/gstComplianceController';

const router = express.Router();

router.get('/gstr-1', getGSTR1);
router.get('/gstr-2b', getGSTR2B);
router.get('/gstr-3b', getGSTR3B);
router.get('/tds-26q', getTdsReturn);

export default router;

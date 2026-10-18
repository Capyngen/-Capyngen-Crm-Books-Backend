import express from 'express';
import {
  getFiscalYears,
  previewClosing,
  executeClosing
} from '../controllers/yearEndClosingController';

const router = express.Router();

router.get('/fiscal-years', getFiscalYears);
router.get('/preview/:fiscalYearId', previewClosing);
router.post('/execute/:fiscalYearId', executeClosing);

export default router;

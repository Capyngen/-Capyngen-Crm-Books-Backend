import express from 'express';
import { getSecurePortalLink, getStatementOfAccount, getOpenInvoices } from '../../billing/controllers/customerPortalController';

const router = express.Router();

// NOTE: In production, these endpoints (except getSecurePortalLink) would be authenticated via the secure token middleware
router.get('/:customerId/secure-link', getSecurePortalLink);
router.get('/:customerId/statement', getStatementOfAccount);
router.get('/:customerId/invoices', getOpenInvoices);

export default router;

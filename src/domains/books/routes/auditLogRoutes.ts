import express from 'express';
import { getAuditLogs, createAuditLog } from '../controllers/auditLogController';

const router = express.Router();

router.get('/', getAuditLogs);
router.post('/', createAuditLog);

export default router;

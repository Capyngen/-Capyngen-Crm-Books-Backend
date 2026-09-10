import express from 'express';
import { setupOrganization, getOrganizations } from '../controllers/orgController';
import { joinOrganization } from '../controllers/userManagementController';

const router = express.Router();

router.post('/setup', setupOrganization);
router.get('/', getOrganizations);
router.post('/join', joinOrganization);

export default router;

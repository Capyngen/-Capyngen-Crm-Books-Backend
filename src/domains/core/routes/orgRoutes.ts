import express from 'express';
import { setupOrganization, getOrganizations } from '../controllers/orgController';
import { joinOrganization } from '../controllers/userManagementController';
import { purgeCompanyTestData } from '../controllers/adminDataController';

const router = express.Router();

router.post('/setup', setupOrganization);
router.get('/', getOrganizations);
router.post('/join', joinOrganization);
router.post('/purge-test-data', purgeCompanyTestData);

export default router;

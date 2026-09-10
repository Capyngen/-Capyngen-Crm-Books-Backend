import express from 'express';
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from '../controllers/roleController';
import { inviteUser, getOrganizationUsers, updateUserRole, removeUserFromOrg } from '../controllers/userManagementController';
import { requirePermission } from '../middlewares/permissionMiddleware';

const router = express.Router();

// Role Routes
// Require Admin to manage roles/users for now, or specific permissions like 'settings.roles.manage'
router.get('/roles', requirePermission('settings', 'roles'), getRoles);
router.get('/roles/:id', requirePermission('settings', 'roles'), getRoleById);
router.post('/roles', requirePermission('settings', 'roles'), createRole);
router.put('/roles/:id', requirePermission('settings', 'roles'), updateRole);
router.delete('/roles/:id', requirePermission('settings', 'roles'), deleteRole);

// User Management Routes
router.get('/users', requirePermission('settings', 'users'), getOrganizationUsers);
router.post('/users/invite', requirePermission('settings', 'users'), inviteUser);
router.put('/users/:id', requirePermission('settings', 'users'), updateUserRole);
router.delete('/users/:id', requirePermission('settings', 'users'), removeUserFromOrg);

export default router;

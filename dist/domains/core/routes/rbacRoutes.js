"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roleController_1 = require("../controllers/roleController");
const userManagementController_1 = require("../controllers/userManagementController");
const permissionMiddleware_1 = require("../middlewares/permissionMiddleware");
const router = express_1.default.Router();
// Role Routes
// Require Admin to manage roles/users for now, or specific permissions like 'settings.roles.manage'
router.get('/roles', (0, permissionMiddleware_1.requirePermission)('settings', 'roles'), roleController_1.getRoles);
router.get('/roles/:id', (0, permissionMiddleware_1.requirePermission)('settings', 'roles'), roleController_1.getRoleById);
router.post('/roles', (0, permissionMiddleware_1.requirePermission)('settings', 'roles'), roleController_1.createRole);
router.put('/roles/:id', (0, permissionMiddleware_1.requirePermission)('settings', 'roles'), roleController_1.updateRole);
router.delete('/roles/:id', (0, permissionMiddleware_1.requirePermission)('settings', 'roles'), roleController_1.deleteRole);
// User Management Routes
router.get('/users', (0, permissionMiddleware_1.requirePermission)('settings', 'users'), userManagementController_1.getOrganizationUsers);
router.post('/users/invite', (0, permissionMiddleware_1.requirePermission)('settings', 'users'), userManagementController_1.inviteUser);
router.patch('/users/:id/books-role', (0, permissionMiddleware_1.requirePermission)('settings', 'users'), userManagementController_1.assignEmployeeRole);
router.put('/users/:id', (0, permissionMiddleware_1.requirePermission)('settings', 'users'), userManagementController_1.updateUserRole);
router.delete('/users/:id', (0, permissionMiddleware_1.requirePermission)('settings', 'users'), userManagementController_1.removeUserFromOrg);
exports.default = router;

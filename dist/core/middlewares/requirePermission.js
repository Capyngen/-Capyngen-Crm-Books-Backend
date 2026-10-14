"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = void 0;
const Role_1 = require("../models/Role");
const requirePermission = (permissionKey) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            const orgId = req.org?._id;
            if (!user || !orgId)
                return res.status(401).json({ success: false, message: 'Unauthorized access' });
            // Bypass for Owner / Admin roles implicitly
            if (user.role === 'Owner' || user.role === 'Admin')
                return next();
            const userRole = await Role_1.Role.findOne({ orgId, name: user.role }).lean();
            if (!userRole || !userRole.permissions.includes(permissionKey)) {
                return res.status(403).json({ success: false, message: `Forbidden: Requires ${permissionKey}` });
            }
            next();
        }
        catch (e) {
            res.status(500).json({ success: false, message: 'RBAC verification failed' });
        }
    };
};
exports.requirePermission = requirePermission;

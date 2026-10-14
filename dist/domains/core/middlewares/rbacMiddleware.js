"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRbacContext = void 0;
const UserOrganization_1 = require("../models/UserOrganization");
const Role_1 = require("../models/Role");
const context_1 = require("../../../context");
// Helper to get all child user IDs in the hierarchy
async function getChildUserIds(orgId, roleId) {
    // 1. Find all descendant roles of this roleId
    const allRoles = await Role_1.Role.find({ orgId }).lean();
    const descendantRoleIds = new Set();
    const queue = [roleId];
    while (queue.length > 0) {
        const current = queue.shift();
        const children = allRoles.filter(r => r.parentRoleId?.toString() === current);
        for (const child of children) {
            const cId = child._id.toString();
            if (!descendantRoleIds.has(cId)) {
                descendantRoleIds.add(cId);
                queue.push(cId);
            }
        }
    }
    if (descendantRoleIds.size === 0)
        return [];
    // 2. Find all users assigned to these descendant roles
    const users = await UserOrganization_1.UserOrganization.find({
        orgId,
        roleId: { $in: Array.from(descendantRoleIds) },
        status: 'Active'
    }).lean();
    return users.map(u => u.userId?.toString()).filter(Boolean);
}
const loadRbacContext = async (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const orgId = req.headers['x-org-id'];
    if (!userId || !orgId) {
        return context_1.requestContext.run({ userId, orgId }, next);
    }
    try {
        console.log("RBAC Context Check:", { userId, orgId });
        const mapping = await UserOrganization_1.UserOrganization.findOne({ userId, orgId }).populate('roleId').lean();
        console.log("Mapping found:", !!mapping);
        if (!mapping) {
            // Not part of org
            return context_1.requestContext.run({ userId, orgId }, next);
        }
        const isAdmin = mapping.isAdmin === true;
        console.log("Is Admin:", isAdmin);
        let permissions = {};
        let childUserIds = [];
        let roleIdStr = mapping.roleId ? mapping.roleId._id.toString() : undefined;
        if (!isAdmin && mapping.roleId) {
            permissions = mapping.roleId.permissions || {};
            childUserIds = await getChildUserIds(orgId, roleIdStr);
        }
        context_1.requestContext.run({
            userId,
            orgId,
            roleId: roleIdStr,
            isAdmin,
            permissions,
            childUserIds
        }, next);
    }
    catch (error) {
        console.error('Error loading RBAC context:', error);
        next(error);
    }
};
exports.loadRbacContext = loadRbacContext;

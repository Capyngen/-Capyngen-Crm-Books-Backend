"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleById = exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoles = void 0;
const Role_1 = require("../models/Role");
const context_1 = require("../../../context");
const getRoles = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const roles = await Role_1.Role.find({ orgId }).lean();
        res.status(200).json({ success: true, data: roles });
    }
    catch (error) {
        next(error);
    }
};
exports.getRoles = getRoles;
const createRole = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const { name, description, parentRoleId, permissions } = req.body;
        // Ensure parent role is within the same org
        if (parentRoleId) {
            const parent = await Role_1.Role.findOne({ _id: parentRoleId, orgId });
            if (!parent)
                return res.status(400).json({ success: false, message: 'Invalid parent role' });
        }
        const role = new Role_1.Role({ orgId, name, description, parentRoleId, permissions });
        await role.save();
        res.status(201).json({ success: true, data: role });
    }
    catch (error) {
        next(error);
    }
};
exports.createRole = createRole;
const updateRole = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        const roleId = req.params.id;
        const { name, description, parentRoleId, permissions } = req.body;
        const role = await Role_1.Role.findOneAndUpdate({ _id: roleId, orgId }, { name, description, parentRoleId, permissions }, { new: true });
        if (!role)
            return res.status(404).json({ success: false, message: 'Role not found' });
        res.status(200).json({ success: true, data: role });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        const roleId = req.params.id;
        const role = await Role_1.Role.findOneAndDelete({ _id: roleId, orgId });
        if (!role)
            return res.status(404).json({ success: false, message: 'Role not found' });
        // Unassign this role from children
        await Role_1.Role.updateMany({ parentRoleId: roleId, orgId }, { $unset: { parentRoleId: 1 } });
        res.status(200).json({ success: true, message: 'Role deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRole = deleteRole;
const getRoleById = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const role = await Role_1.Role.findOne({ _id: req.params.id, orgId }).lean();
        if (!role)
            return res.status(404).json({ success: false, message: 'Role not found' });
        res.status(200).json({ success: true, data: role });
    }
    catch (error) {
        next(error);
    }
};
exports.getRoleById = getRoleById;

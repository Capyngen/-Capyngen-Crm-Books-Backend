"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinOrganization = exports.removeUserFromOrg = exports.updateUserRole = exports.getOrganizationUsers = exports.inviteUser = void 0;
const UserOrganization_1 = require("../models/UserOrganization");
const User_1 = require("../models/User");
const context_1 = require("../../../context");
const inviteUser = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        let { email, name, roleId } = req.body;
        email = email.toLowerCase();
        if (!roleId) {
            return res.status(400).json({ success: false, message: 'Role is required' });
        }
        // Check if mapping already exists
        let mapping = await UserOrganization_1.UserOrganization.findOne({ email, orgId });
        if (mapping) {
            return res.status(400).json({ success: false, message: 'User is already invited or active in this organization' });
        }
        // Try to find if user already has an account
        const existingUser = await User_1.User.findOne({ email });
        mapping = new UserOrganization_1.UserOrganization({
            email,
            name,
            orgId,
            roleId,
            userId: existingUser ? existingUser._id : undefined,
            status: existingUser ? 'Active' : 'Invited'
        });
        await mapping.save();
        res.status(201).json({ success: true, message: 'User invited successfully', data: mapping });
    }
    catch (error) {
        console.error("UserManagement Error:", error);
        next(error);
    }
};
exports.inviteUser = inviteUser;
const getOrganizationUsers = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        const users = await UserOrganization_1.UserOrganization.find({ orgId }).populate('roleId').lean();
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        console.error("UserManagement Error:", error);
        next(error);
    }
};
exports.getOrganizationUsers = getOrganizationUsers;
const updateUserRole = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        const mappingId = req.params.id;
        const { roleId } = req.body;
        const mapping = await UserOrganization_1.UserOrganization.findOneAndUpdate({ _id: mappingId, orgId }, { roleId }, { new: true });
        if (!mapping)
            return res.status(404).json({ success: false, message: 'User mapping not found' });
        res.status(200).json({ success: true, data: mapping });
    }
    catch (error) {
        console.error("UserManagement Error:", error);
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
const removeUserFromOrg = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId;
        const mappingId = req.params.id;
        const checkMapping = await UserOrganization_1.UserOrganization.findOne({ _id: mappingId, orgId });
        if (!checkMapping)
            return res.status(404).json({ success: false, message: 'User mapping not found' });
        if (checkMapping.isAdmin)
            return res.status(403).json({ success: false, message: 'Cannot remove organization admin' });
        const mapping = await UserOrganization_1.UserOrganization.findOneAndDelete({ _id: mappingId, orgId });
        if (!mapping)
            return res.status(404).json({ success: false, message: 'User mapping not found' });
        res.status(200).json({ success: true, message: 'User removed from organization' });
    }
    catch (error) {
        console.error("UserManagement Error:", error);
        next(error);
    }
};
exports.removeUserFromOrg = removeUserFromOrg;
const joinOrganization = async (req, res, next) => {
    try {
        const userId = context_1.requestContext.getStore()?.userId;
        const { orgId } = req.body;
        if (!userId || !orgId)
            return res.status(400).json({ success: false, message: 'Missing userId or orgId' });
        const mapping = await UserOrganization_1.UserOrganization.findOneAndUpdate({ userId, orgId, status: 'Invited' }, { status: 'Active' }, { new: true });
        if (!mapping)
            return res.status(404).json({ success: false, message: 'Invite not found or already active' });
        res.status(200).json({ success: true, data: mapping });
    }
    catch (error) {
        console.error("UserManagement Error:", error);
        next(error);
    }
};
exports.joinOrganization = joinOrganization;

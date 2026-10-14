"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizations = exports.setupOrganization = void 0;
const UserOrganization_1 = require("../models/UserOrganization");
const User_1 = require("../models/User");
const Organization_1 = require("../models/Organization");
const setupOrganization = async (req, res) => {
    try {
        const { userId, companyName, industry, location, state, currency, language, timeZone, gstRegistered, gstNumber } = req.body;
        const org = new Organization_1.Organization({
            ownerId: userId,
            companyName,
            industry,
            location,
            state,
            currency,
            language,
            timeZone,
            gstRegistered,
            gstNumber
        });
        await org.save();
        // Create Admin mapping
        const user = await User_1.User.findById(userId);
        if (user) {
            await UserOrganization_1.UserOrganization.create({
                email: user.email,
                userId: user._id,
                orgId: org._id.toString(),
                isAdmin: true,
                status: 'Active',
                name: user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin User'
            });
        }
        res.status(201).json({ message: 'Organization created', organization: org });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.setupOrganization = setupOrganization;
const getOrganizations = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        // Fetch orgs where user is owner OR mapped via UserOrganization
        const mappings = await UserOrganization_1.UserOrganization.find({ userId });
        const mappedOrgIds = mappings.map(m => m.orgId);
        const orgs = await Organization_1.Organization.find({ $or: [{ ownerId: userId }, { _id: { $in: mappedOrgIds } }] }).lean();
        // Attach mapping info
        const populatedOrgs = await Promise.all(orgs.map(async (org) => {
            let mapping = mappings.find(m => m.orgId === org._id.toString());
            if (!mapping && org.ownerId?.toString() === userId) {
                mapping = { isAdmin: true };
            }
            let perms = {};
            if (mapping && mapping.roleId) {
                const Role = require('../models/Role').default;
                const roleObj = await Role.findById(mapping.roleId).lean();
                if (roleObj && roleObj.permissions) {
                    perms = roleObj.permissions;
                }
            }
            return {
                ...org,
                isAdmin: mapping?.isAdmin || false,
                rolePermissions: perms,
                status: mapping?.status || "Active"
            };
        }));
        res.status(200).json({ success: true, data: populatedOrgs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getOrganizations = getOrganizations;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizations = exports.setupOrganization = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
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
        const userId = req.headers['x-user-id'] || req.user?._id;
        const userEmail = req.user?.email;
        // Fetch mappings by userId or email
        const query = {};
        if (userId && mongoose_1.default.isValidObjectId(userId)) {
            query.$or = [{ userId: new mongoose_1.default.Types.ObjectId(userId) }, { userId: userId.toString() }];
            if (userEmail)
                query.$or.push({ email: userEmail.toLowerCase() });
        }
        else if (userEmail) {
            query.email = userEmail.toLowerCase();
        }
        else if (userId) {
            query.userId = userId;
        }
        const mappings = await UserOrganization_1.UserOrganization.find(query).populate('roleId').lean();
        const mappedOrgIds = mappings.map(m => m.orgId).filter(Boolean);
        // Also check if user has companyId in employees collection
        if (userId && mongoose_1.default.isValidObjectId(userId)) {
            const emp = await mongoose_1.default.connection.collection('employees').findOne({ _id: new mongoose_1.default.Types.ObjectId(userId) });
            if (emp && emp.companyId) {
                const empOrgId = emp.companyId.toString();
                if (!mappedOrgIds.includes(empOrgId))
                    mappedOrgIds.push(empOrgId);
            }
        }
        else if (userEmail) {
            const emp = await mongoose_1.default.connection.collection('employees').findOne({ email: userEmail.toLowerCase() });
            if (emp && emp.companyId) {
                const empOrgId = emp.companyId.toString();
                if (!mappedOrgIds.includes(empOrgId))
                    mappedOrgIds.push(empOrgId);
            }
        }
        // 1. Fetch from companyprofiles (HRMS & Books ecosystem)
        const validObjectIds = mappedOrgIds.filter(id => mongoose_1.default.isValidObjectId(id)).map(id => new mongoose_1.default.Types.ObjectId(id));
        const companyProfiles = await mongoose_1.default.connection.collection('companyprofiles').find({
            _id: { $in: validObjectIds }
        }).toArray();
        // 2. Also check Organization collection (fallback)
        const orgCollection = await Organization_1.Organization.find({
            $or: [{ ownerId: userId }, { _id: { $in: mappedOrgIds } }]
        }).lean();
        // Combine organizations
        const allOrgList = [];
        const seenOrgIds = new Set();
        for (const cp of companyProfiles) {
            const orgIdStr = cp._id.toString();
            seenOrgIds.add(orgIdStr);
            const mapping = mappings.find(m => m.orgId === orgIdStr);
            let perms = {};
            let roleName = 'Employee';
            if (mapping && mapping.roleId) {
                perms = mapping.roleId.permissions || {};
                roleName = mapping.roleId.name || 'Employee';
            }
            const isSystemAdmin = req.user?.role === 'Admin' || req.user?.role === 'Owner';
            const isAdmin = mapping ? (mapping.isAdmin || isSystemAdmin) : isSystemAdmin;
            allOrgList.push({
                _id: orgIdStr,
                id: orgIdStr,
                name: cp.companyName || 'Organization',
                companyName: cp.companyName || 'Organization',
                country: cp.country || 'India',
                currency: cp.currency || 'INR',
                isAdmin,
                role: roleName,
                rolePermissions: perms,
                status: mapping?.status || 'Active'
            });
        }
        for (const o of orgCollection) {
            const orgIdStr = o._id.toString();
            if (!seenOrgIds.has(orgIdStr)) {
                seenOrgIds.add(orgIdStr);
                const mapping = mappings.find(m => m.orgId === orgIdStr);
                let perms = {};
                let roleName = 'Employee';
                if (mapping && mapping.roleId) {
                    perms = mapping.roleId.permissions || {};
                    roleName = mapping.roleId.name || 'Employee';
                }
                allOrgList.push({
                    _id: orgIdStr,
                    id: orgIdStr,
                    name: o.companyName || 'Organization',
                    companyName: o.companyName || 'Organization',
                    isAdmin: mapping?.isAdmin || false,
                    role: roleName,
                    rolePermissions: perms,
                    status: mapping?.status || 'Active'
                });
            }
        }
        res.status(200).json({ success: true, data: allOrgList });
    }
    catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getOrganizations = getOrganizations;

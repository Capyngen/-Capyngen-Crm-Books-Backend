"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinOrganization = exports.removeUserFromOrg = exports.updateUserRole = exports.getOrganizationUsers = exports.assignEmployeeRole = exports.inviteUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserOrganization_1 = require("../models/UserOrganization");
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const context_1 = require("../../../context");
const inviteUser = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || req.headers['x-org-id'] || req.org?._id;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId context' });
        let { email, name, roleId, booksRole, password } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        email = email.trim().toLowerCase();
        const effectiveRoleKey = roleId || booksRole;
        if (!effectiveRoleKey) {
            return res.status(400).json({ success: false, message: 'Role is required' });
        }
        // 1. Resolve or Create Role
        let roleDoc = null;
        if (mongoose_1.default.isValidObjectId(effectiveRoleKey)) {
            roleDoc = await Role_1.Role.findById(effectiveRoleKey);
        }
        if (!roleDoc) {
            roleDoc = await Role_1.Role.findOne({ orgId, name: effectiveRoleKey }) || await Role_1.Role.findOne({ name: effectiveRoleKey });
        }
        if (!roleDoc) {
            // Create role if doesn't exist
            roleDoc = new Role_1.Role({
                orgId,
                name: effectiveRoleKey,
                description: `${effectiveRoleKey} Role`,
                permissions: {}
            });
            await roleDoc.save();
        }
        // 2. Handle Password & User/Employee Collections
        let empDoc = null;
        let existingUser = await User_1.User.findOne({ email });
        if (password) {
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            // Update or create User
            if (!existingUser) {
                existingUser = new User_1.User({
                    email,
                    password: hashedPassword,
                    role: 'Business User',
                    isVerified: true
                });
                await existingUser.save();
            }
            else {
                existingUser.password = hashedPassword;
                await existingUser.save();
            }
            // Check HRMS employees collection so they can log in via employee login
            try {
                let orgIdObj = null;
                try {
                    orgIdObj = new mongoose_1.default.Types.ObjectId(orgId);
                }
                catch { }
                empDoc = await mongoose_1.default.connection.collection('employees').findOne({ email });
                if (!empDoc) {
                    const names = (name || '').trim().split(' ');
                    const firstName = names[0] || 'User';
                    const lastName = names.slice(1).join(' ') || '';
                    const genEmpId = `EMP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
                    const result = await mongoose_1.default.connection.collection('employees').insertOne({
                        employeeId: genEmpId,
                        email,
                        password: hashedPassword,
                        firstName,
                        lastName,
                        role: 'Employee',
                        companyId: orgIdObj || orgId,
                        isActive: true,
                        booksRole: roleDoc.name,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    empDoc = { _id: result.insertedId };
                }
                else {
                    await mongoose_1.default.connection.collection('employees').updateOne({ _id: empDoc._id }, { $set: { booksRole: roleDoc.name, password: hashedPassword, isActive: true } });
                }
            }
            catch (empErr) {
                console.error('Error syncing employee doc during invite:', empErr);
            }
        }
        else {
            empDoc = await mongoose_1.default.connection.collection('employees').findOne({ email });
        }
        // 3. Upsert UserOrganization Mapping
        const mapping = await UserOrganization_1.UserOrganization.findOneAndUpdate({ email, orgId }, {
            email,
            name: name || existingUser?.companyName || email.split('@')[0],
            orgId,
            roleId: roleDoc._id,
            userId: empDoc ? empDoc._id : (existingUser ? existingUser._id : undefined),
            status: 'Active'
        }, { upsert: true, new: true });
        res.status(201).json({
            success: true,
            message: 'User created & role assigned successfully',
            data: mapping
        });
    }
    catch (error) {
        console.error("UserManagement Error:", error);
        next(error);
    }
};
exports.inviteUser = inviteUser;
const assignEmployeeRole = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || req.headers['x-org-id'] || req.org?._id;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId context' });
        const employeeId = req.params.id;
        const { booksRole, roleId } = req.body;
        const targetRoleKey = roleId || booksRole;
        if (!targetRoleKey) {
            return res.status(400).json({ success: false, message: 'Role is required' });
        }
        // Find employee
        let empDoc = null;
        if (typeof employeeId === 'string' && mongoose_1.default.isValidObjectId(employeeId)) {
            empDoc = await mongoose_1.default.connection.collection('employees').findOne({ _id: new mongoose_1.default.Types.ObjectId(employeeId) });
        }
        if (!empDoc) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        // Resolve Role
        let roleDoc = null;
        if (mongoose_1.default.isValidObjectId(targetRoleKey)) {
            roleDoc = await Role_1.Role.findById(targetRoleKey);
        }
        if (!roleDoc) {
            roleDoc = await Role_1.Role.findOne({ orgId, name: targetRoleKey }) || await Role_1.Role.findOne({ name: targetRoleKey });
        }
        if (!roleDoc) {
            roleDoc = new Role_1.Role({
                orgId,
                name: targetRoleKey,
                description: `${targetRoleKey} Role`,
                permissions: {}
            });
            await roleDoc.save();
        }
        // Update employee record in HRMS
        await mongoose_1.default.connection.collection('employees').updateOne({ _id: empDoc._id }, { $set: { booksRole: roleDoc.name } });
        // Upsert UserOrganization
        const mapping = await UserOrganization_1.UserOrganization.findOneAndUpdate({ email: empDoc.email.toLowerCase(), orgId }, {
            email: empDoc.email.toLowerCase(),
            name: `${empDoc.firstName || ''} ${empDoc.lastName || ''}`.trim() || empDoc.email,
            orgId,
            roleId: roleDoc._id,
            userId: empDoc._id,
            status: 'Active'
        }, { upsert: true, new: true });
        res.status(200).json({ success: true, message: 'Role assigned successfully', data: mapping });
    }
    catch (error) {
        console.error("AssignEmployeeRole Error:", error);
        next(error);
    }
};
exports.assignEmployeeRole = assignEmployeeRole;
const getOrganizationUsers = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || req.headers['x-org-id'] || req.org?._id;
        if (!orgId)
            return res.status(400).json({ success: false, message: 'Missing orgId' });
        // 1. Fetch from UserOrganization
        const mappings = await UserOrganization_1.UserOrganization.find({ orgId }).populate('roleId').lean();
        // 2. Also fetch HRMS employees for this company to show full directory
        let orgIdObj = null;
        try {
            orgIdObj = new mongoose_1.default.Types.ObjectId(orgId);
        }
        catch { }
        const employees = orgIdObj
            ? await mongoose_1.default.connection.collection('employees').find({ companyId: orgIdObj }).toArray()
            : [];
        // Merge: For each employee, if mapping exists, attach roleId and name
        const emailToMapping = new Map();
        mappings.forEach(m => emailToMapping.set(m.email.toLowerCase(), m));
        const combinedList = [];
        const seenEmails = new Set();
        for (const emp of employees) {
            const email = emp.email?.toLowerCase();
            seenEmails.add(email);
            const mapping = emailToMapping.get(email);
            combinedList.push({
                _id: emp._id.toString(),
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                role: emp.role || 'Employee',
                isWorkspaceOwner: emp.role === 'Admin' || emp.role === 'Owner',
                booksRole: mapping?.roleId?.name || emp.booksRole || 'No Access',
                roleId: mapping?.roleId || null,
                status: emp.isActive !== false ? 'Active' : 'Inactive',
                isActive: emp.isActive !== false
            });
        }
        // Add any mappings not present in employees collection
        for (const m of mappings) {
            if (!seenEmails.has(m.email.toLowerCase())) {
                const names = (m.name || '').split(' ');
                combinedList.push({
                    _id: m._id.toString(),
                    firstName: names[0] || m.name,
                    lastName: names.slice(1).join(' ') || '',
                    email: m.email,
                    role: m.isAdmin ? 'Admin' : 'Member',
                    isWorkspaceOwner: m.isAdmin,
                    booksRole: m.roleId?.name || 'No Access',
                    roleId: m.roleId,
                    status: m.status,
                    isActive: m.status === 'Active'
                });
            }
        }
        res.status(200).json({ success: true, data: combinedList });
    }
    catch (error) {
        console.error("UserManagement Error:", error);
        next(error);
    }
};
exports.getOrganizationUsers = getOrganizationUsers;
const updateUserRole = async (req, res, next) => {
    try {
        const orgId = context_1.requestContext.getStore()?.orgId || req.headers['x-org-id'] || req.org?._id;
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
        const orgId = context_1.requestContext.getStore()?.orgId || req.headers['x-org-id'] || req.org?._id;
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
        const userId = context_1.requestContext.getStore()?.userId || req.headers['x-user-id'] || req.user?._id;
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

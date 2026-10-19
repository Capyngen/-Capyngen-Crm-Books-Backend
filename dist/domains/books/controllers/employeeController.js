"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrgHierarchy = exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployeeById = exports.getEmployees = void 0;
const Employee_1 = __importDefault(require("../models/Employee"));
const getEmployees = async (req, res) => {
    try {
        const orgId = req.org?._id || req.query.orgId || req.query.companyId;
        const query = {};
        if (orgId) {
            query.$or = [{ orgId }, { companyId: orgId }];
        }
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.department) {
            query.department = req.query.department;
        }
        if (req.query.search) {
            const s = String(req.query.search);
            query.$or = [
                { employeeName: { $regex: s, $options: 'i' } },
                { employeeCode: { $regex: s, $options: 'i' } },
                { email: { $regex: s, $options: 'i' } },
                { designation: { $regex: s, $options: 'i' } }
            ];
        }
        const employees = await Employee_1.default.find(query).sort({ employeeCode: 1, createdAt: -1 });
        res.json({ success: true, data: employees, count: employees.length });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getEmployees = getEmployees;
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee_1.default.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, data: employee });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getEmployeeById = getEmployeeById;
const createEmployee = async (req, res) => {
    try {
        const orgId = req.org?._id || req.body.orgId || req.body.companyId || 'SYSTEM';
        // Auto-generate employeeCode if omitted
        let employeeCode = req.body.employeeCode;
        if (!employeeCode) {
            const count = await Employee_1.default.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
            employeeCode = `EMP-${String(count + 1).padStart(3, '0')}`;
        }
        const firstName = req.body.firstName || req.body.employeeName?.split(' ')[0] || 'Employee';
        const lastName = req.body.lastName || req.body.employeeName?.split(' ').slice(1).join(' ') || '';
        const employeeName = req.body.employeeName || `${firstName} ${lastName}`.trim();
        const employee = new Employee_1.default({
            ...req.body,
            orgId,
            companyId: orgId,
            employeeCode,
            firstName,
            lastName,
            employeeName
        });
        const saved = await employee.save();
        res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Bad Request' });
    }
};
exports.createEmployee = createEmployee;
const updateEmployee = async (req, res) => {
    try {
        if (req.body.firstName || req.body.lastName) {
            const fn = req.body.firstName || '';
            const ln = req.body.lastName || '';
            if (!req.body.employeeName) {
                req.body.employeeName = `${fn} ${ln}`.trim();
            }
        }
        const updated = await Employee_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Bad Request' });
    }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res) => {
    try {
        const deleted = await Employee_1.default.findByIdAndUpdate(req.params.id, { status: 'Terminated' }, { new: true });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        res.json({ success: true, message: 'Employee deactivated successfully', data: deleted });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.deleteEmployee = deleteEmployee;
const getOrgHierarchy = async (req, res) => {
    try {
        const orgId = req.org?._id || req.query.orgId || req.query.companyId;
        const query = { status: { $ne: 'Terminated' } };
        if (orgId) {
            query.$or = [{ orgId }, { companyId: orgId }];
        }
        const employees = await Employee_1.default.find(query).select('employeeName employeeCode department designation role managerId');
        // Build tree
        const empMap = new Map();
        employees.forEach(e => empMap.set(e._id.toString(), { ...e.toObject(), reportees: [] }));
        const rootNodes = [];
        empMap.forEach((emp) => {
            if (emp.managerId && empMap.has(emp.managerId.toString())) {
                empMap.get(emp.managerId.toString()).reportees.push(emp);
            }
            else {
                rootNodes.push(emp);
            }
        });
        res.json({ success: true, data: rootNodes });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getOrgHierarchy = getOrgHierarchy;

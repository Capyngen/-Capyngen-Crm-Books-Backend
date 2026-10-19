"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSalaryStructures = exports.getSalaryStructureByEmployee = exports.createOrUpdateSalaryStructure = void 0;
const SalaryStructure_1 = __importDefault(require("../models/SalaryStructure"));
const Employee_1 = __importDefault(require("../models/Employee"));
const StatutoryComplianceService_1 = require("../services/StatutoryComplianceService");
const createOrUpdateSalaryStructure = async (req, res) => {
    try {
        const orgId = req.org?._id || req.body.orgId || req.body.companyId || 'SYSTEM';
        const { employeeId } = req.body;
        const emp = await Employee_1.default.findById(employeeId);
        if (!emp) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        let annualCTC = Number(req.body.annualCTC || 0);
        let monthlyCTC = Number(req.body.monthlyCTC || 0);
        if (annualCTC > 0 && monthlyCTC === 0) {
            monthlyCTC = Math.round(annualCTC / 12);
        }
        else if (monthlyCTC > 0 && annualCTC === 0) {
            annualCTC = monthlyCTC * 12;
        }
        // Default structure breakdown if not explicitly supplied
        let basic = req.body.basic !== undefined ? Number(req.body.basic) : Math.round(monthlyCTC * 0.5);
        let hra = req.body.hra !== undefined ? Number(req.body.hra) : Math.round(basic * 0.5);
        let conveyance = req.body.conveyanceAllowance !== undefined ? Number(req.body.conveyanceAllowance) : 1600;
        let medical = req.body.medicalAllowance !== undefined ? Number(req.body.medicalAllowance) : 1250;
        let otherAllowances = req.body.otherAllowances !== undefined ? Number(req.body.otherAllowances) : 0;
        let specialAllowance = req.body.specialAllowance !== undefined
            ? Number(req.body.specialAllowance)
            : Math.max(0, monthlyCTC - (basic + hra + conveyance + medical + otherAllowances));
        const grossSalary = basic + hra + conveyance + medical + specialAllowance + otherAllowances;
        const epfApplicable = req.body.epfApplicable !== undefined ? Boolean(req.body.epfApplicable) : true;
        const epfStatutoryCeiling = req.body.epfStatutoryCeiling !== undefined ? Boolean(req.body.epfStatutoryCeiling) : true;
        const esiApplicable = req.body.esiApplicable !== undefined ? Boolean(req.body.esiApplicable) : grossSalary <= 21000;
        const professionalTaxState = req.body.professionalTaxState || 'Maharashtra';
        const tdsMonthly = Number(req.body.tdsMonthly || 0);
        // Compute statutory
        const epf = epfApplicable
            ? StatutoryComplianceService_1.StatutoryComplianceService.calculateEPF(basic, epfStatutoryCeiling)
            : { employeePF: 0, employerPF: 0, employerEPS: 0, employerEDLI: 0, employerAdmin: 0, totalEmployerContribution: 0 };
        const esi = esiApplicable
            ? StatutoryComplianceService_1.StatutoryComplianceService.calculateESIC(grossSalary)
            : { employeeESI: 0, employerESI: 0, totalESI: 0 };
        const pt = req.body.professionalTax !== undefined
            ? Number(req.body.professionalTax)
            : StatutoryComplianceService_1.StatutoryComplianceService.calculateProfessionalTax(grossSalary, professionalTaxState);
        const totalDeductions = epf.employeePF + esi.employeeESI + pt + tdsMonthly;
        const netMonthlyPay = Math.max(0, grossSalary - totalDeductions);
        const gratuity = Math.round(basic * 0.0481);
        const totalEmployerContribution = epf.totalEmployerContribution + esi.employerESI + gratuity;
        // Archive previous active structure
        await SalaryStructure_1.default.updateMany({ employeeId, status: 'Active' }, { status: 'Archived' });
        const newStruct = new SalaryStructure_1.default({
            orgId,
            companyId: orgId,
            employeeId,
            employeeName: emp.employeeName,
            employeeCode: emp.employeeCode,
            annualCTC,
            monthlyCTC,
            basic,
            hra,
            conveyanceAllowance: conveyance,
            medicalAllowance: medical,
            specialAllowance,
            otherAllowances,
            grossSalary,
            epfApplicable,
            epfStatutoryCeiling,
            epfEmployee: epf.employeePF,
            esiApplicable,
            esiEmployee: esi.employeeESI,
            professionalTaxState,
            professionalTax: pt,
            tdsMonthly,
            totalDeductions,
            employerPF: epf.employerPF,
            employerEPS: epf.employerEPS,
            employerPFAdmin: epf.employerAdmin,
            employerEDLI: epf.employerEDLI,
            employerESI: esi.employerESI,
            gratuityProvision: gratuity,
            totalEmployerContribution,
            netMonthlyPay,
            effectiveFrom: req.body.effectiveFrom ? new Date(req.body.effectiveFrom) : new Date(),
            status: 'Active'
        });
        const saved = await newStruct.save();
        // Link back to employee
        emp.salaryStructureId = saved._id;
        emp.costRate = Math.round((monthlyCTC / 160) * 100) / 100;
        await emp.save();
        res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Bad Request' });
    }
};
exports.createOrUpdateSalaryStructure = createOrUpdateSalaryStructure;
const getSalaryStructureByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const structure = await SalaryStructure_1.default.findOne({ employeeId, status: 'Active' });
        if (!structure) {
            return res.status(404).json({ success: false, message: 'Active salary structure not found' });
        }
        res.json({ success: true, data: structure });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getSalaryStructureByEmployee = getSalaryStructureByEmployee;
const getAllSalaryStructures = async (req, res) => {
    try {
        const orgId = req.org?._id || req.query.orgId || req.query.companyId;
        const query = { status: 'Active' };
        if (orgId) {
            query.$or = [{ orgId }, { companyId: orgId }];
        }
        const structures = await SalaryStructure_1.default.find(query).sort({ employeeCode: 1 });
        res.json({ success: true, data: structures, count: structures.length });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getAllSalaryStructures = getAllSalaryStructures;

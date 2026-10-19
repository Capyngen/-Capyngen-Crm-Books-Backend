"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayslipById = exports.downloadESICReturn = exports.downloadEPF_ECRFile = exports.downloadBankDisbursementFile = exports.disbursePayrollBatch = exports.approvePayrollBatch = exports.getPayrollBatchById = exports.getPayrollBatches = exports.processPayrollBatch = void 0;
const PayrollBatch_1 = __importDefault(require("../models/PayrollBatch"));
const Payslip_1 = __importDefault(require("../models/Payslip"));
const PayrollService_1 = require("../services/PayrollService");
const StatutoryComplianceService_1 = require("../services/StatutoryComplianceService");
const processPayrollBatch = async (req, res) => {
    try {
        const orgId = req.org?._id || req.body.orgId || req.body.companyId || 'SYSTEM';
        const month = Number(req.body.month);
        const year = Number(req.body.year || new Date().getFullYear());
        const processedBy = req.user?.email || 'Payroll Admin';
        if (!month || month < 1 || month > 12) {
            return res.status(400).json({ success: false, message: 'Valid month (1-12) is required' });
        }
        const result = await PayrollService_1.PayrollService.runPayrollBatch(orgId, month, year, processedBy);
        res.status(201).json({
            success: true,
            message: `Payroll processed successfully for ${result.batch.payrollPeriod}`,
            data: result.batch,
            payslipsCount: result.payslips.length
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Payroll processing failed' });
    }
};
exports.processPayrollBatch = processPayrollBatch;
const getPayrollBatches = async (req, res) => {
    try {
        const orgId = req.org?._id || req.query.orgId || req.query.companyId;
        const query = {};
        if (orgId) {
            query.$or = [{ orgId }, { companyId: orgId }];
        }
        if (req.query.year) {
            query.year = Number(req.query.year);
        }
        if (req.query.status) {
            query.status = req.query.status;
        }
        const batches = await PayrollBatch_1.default.find(query).sort({ year: -1, month: -1 });
        res.json({ success: true, data: batches, count: batches.length });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getPayrollBatches = getPayrollBatches;
const getPayrollBatchById = async (req, res) => {
    try {
        const batch = await PayrollBatch_1.default.findById(req.params.id);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Payroll batch not found' });
        }
        const payslips = await Payslip_1.default.find({ batchId: batch._id }).sort({ employeeCode: 1 });
        res.json({
            success: true,
            data: {
                batch,
                payslips
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getPayrollBatchById = getPayrollBatchById;
const approvePayrollBatch = async (req, res) => {
    try {
        const approvedBy = req.user?.email || 'Finance Manager';
        const batch = await PayrollService_1.PayrollService.approvePayrollBatch(req.params.id, approvedBy);
        res.json({
            success: true,
            message: `Payroll batch ${batch.batchNumber} approved and posted to General Ledger`,
            data: batch
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Approval failed' });
    }
};
exports.approvePayrollBatch = approvePayrollBatch;
const disbursePayrollBatch = async (req, res) => {
    try {
        const { bankName, referenceNumber, disbursementDate } = req.body;
        if (!bankName || !referenceNumber) {
            return res.status(400).json({ success: false, message: 'Bank name and reference number are required' });
        }
        const batch = await PayrollService_1.PayrollService.disbursePayrollBatch(req.params.id, {
            bankName,
            referenceNumber,
            disbursementDate: disbursementDate ? new Date(disbursementDate) : new Date()
        });
        res.json({
            success: true,
            message: `Payroll batch disbursed and reconciled against Bank in General Ledger`,
            data: batch
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Disbursement failed' });
    }
};
exports.disbursePayrollBatch = disbursePayrollBatch;
const downloadBankDisbursementFile = async (req, res) => {
    try {
        const format = req.query.format || 'HDFC';
        const csvContent = await PayrollService_1.PayrollService.generateBankDisbursementFile(req.params.id, format);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="disbursement_${req.params.id}_${format}.csv"`);
        res.status(200).send(csvContent);
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Bank file generation failed' });
    }
};
exports.downloadBankDisbursementFile = downloadBankDisbursementFile;
const downloadEPF_ECRFile = async (req, res) => {
    try {
        const payslips = await Payslip_1.default.find({ batchId: req.params.id });
        if (!payslips || payslips.length === 0) {
            return res.status(404).json({ success: false, message: 'No payslips found for this batch' });
        }
        const ecrText = StatutoryComplianceService_1.StatutoryComplianceService.generateEPF_ECRFile(payslips);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="EPF_ECR_${req.params.id}.txt"`);
        res.status(200).send(ecrText);
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'ECR generation failed' });
    }
};
exports.downloadEPF_ECRFile = downloadEPF_ECRFile;
const downloadESICReturn = async (req, res) => {
    try {
        const payslips = await Payslip_1.default.find({ batchId: req.params.id });
        if (!payslips || payslips.length === 0) {
            return res.status(404).json({ success: false, message: 'No payslips found for this batch' });
        }
        const esicCsv = StatutoryComplianceService_1.StatutoryComplianceService.generateESICReturn(payslips);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="ESIC_Return_${req.params.id}.csv"`);
        res.status(200).send(esicCsv);
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'ESIC return generation failed' });
    }
};
exports.downloadESICReturn = downloadESICReturn;
const getPayslipById = async (req, res) => {
    try {
        const payslip = await Payslip_1.default.findById(req.params.id);
        if (!payslip) {
            return res.status(404).json({ success: false, message: 'Payslip not found' });
        }
        res.json({ success: true, data: payslip });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getPayslipById = getPayslipById;

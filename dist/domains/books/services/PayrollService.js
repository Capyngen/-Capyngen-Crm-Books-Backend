"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const Employee_1 = __importDefault(require("../models/Employee"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Leave_1 = require("../models/Leave");
const SalaryStructure_1 = __importDefault(require("../models/SalaryStructure"));
const PayrollBatch_1 = __importDefault(require("../models/PayrollBatch"));
const Payslip_1 = __importDefault(require("../models/Payslip"));
const StatutoryComplianceService_1 = require("./StatutoryComplianceService");
const PostingEngine_1 = require("./PostingEngine");
class PayrollService {
    /**
     * Execute monthly payroll calculation for all active employees of an organization
     */
    static async runPayrollBatch(orgId, month, year, processedBy = 'System Admin') {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const payrollPeriod = `${monthNames[month - 1]} ${year}`;
        const daysInMonth = new Date(year, month, 0).getDate();
        // 1. Fetch all active employees
        const employees = await Employee_1.default.find({
            $or: [{ orgId }, { companyId: orgId }],
            status: { $in: ['Active', 'On Leave', 'Notice Period'] }
        });
        if (employees.length === 0) {
            throw new Error(`No active employees found for organization ${orgId}`);
        }
        // 2. Fetch or create draft PayrollBatch
        const batchNumber = `BATCH-${year}-${String(month).padStart(2, '0')}`;
        let batch = await PayrollBatch_1.default.findOne({
            $or: [{ orgId }, { companyId: orgId }],
            month,
            year
        });
        if (!batch) {
            batch = new PayrollBatch_1.default({
                batchNumber,
                orgId,
                companyId: orgId,
                month,
                year,
                payrollPeriod,
                status: 'Draft',
                processedBy
            });
        }
        // Clear previous draft payslips for this batch/period if re-running
        await Payslip_1.default.deleteMany({ $or: [{ batchId: batch._id }, { orgId, month, year }] });
        // 3. Process each employee
        const payslipsToInsert = [];
        let batchGross = 0;
        let batchDeductions = 0;
        let batchNet = 0;
        let batchEmployerPF = 0;
        let batchEmployerESI = 0;
        let batchPT = 0;
        let batchTDS = 0;
        let batchEmployerCost = 0;
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59));
        for (let i = 0; i < employees.length; i++) {
            const emp = employees[i];
            const payslipNumber = `PS-${year}${String(month).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`;
            // Fetch employee salary structure or synthesize default
            let salaryStruct = await SalaryStructure_1.default.findOne({
                employeeId: emp._id,
                status: 'Active'
            });
            if (!salaryStruct) {
                // Fallback default structure based on costRate or 50,000 baseline
                const monthlyBase = (emp.costRate && emp.costRate > 0) ? emp.costRate * 160 : 50000;
                const basic = Math.round(monthlyBase * 0.5);
                const hra = Math.round(basic * 0.5);
                const specialAllowance = monthlyBase - (basic + hra);
                salaryStruct = {
                    monthlyCTC: monthlyBase,
                    basic,
                    hra,
                    conveyanceAllowance: 1600,
                    medicalAllowance: 1250,
                    specialAllowance,
                    otherAllowances: 0,
                    grossSalary: monthlyBase,
                    epfApplicable: true,
                    epfStatutoryCeiling: true,
                    esiApplicable: monthlyBase <= 21000,
                    professionalTaxState: 'Maharashtra',
                    tdsMonthly: 0
                };
            }
            // Query attendance & approved leaves to compute LOP days
            const attendanceRecords = await Attendance_1.default.find({
                employeeId: emp._id,
                date: { $gte: startDate, $lte: endDate }
            });
            let presentDays = 0;
            let absentDays = 0;
            let halfDays = 0;
            for (const att of attendanceRecords) {
                if (att.status === 'Present')
                    presentDays += 1;
                else if (att.status === 'Half-Day')
                    halfDays += 1;
                else if (att.status === 'Absent')
                    absentDays += 1;
            }
            const totalRecordedPresent = presentDays + (halfDays * 0.5);
            // Approved leaves
            const approvedLeaves = await Leave_1.LeaveApplication.find({
                employeeId: emp._id,
                status: 'Approved',
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            });
            let paidLeaveDays = 0;
            let unpaidLeaveDays = 0;
            for (const l of approvedLeaves) {
                if (l.leaveType === 'Loss of Pay')
                    unpaidLeaveDays += l.totalDays;
                else
                    paidLeaveDays += l.totalDays;
            }
            // If no attendance was logged for the month, assume full present by default
            const lopDays = attendanceRecords.length > 0
                ? Math.max(0, absentDays + unpaidLeaveDays - paidLeaveDays)
                : unpaidLeaveDays;
            const effectivePresent = attendanceRecords.length > 0
                ? totalRecordedPresent + paidLeaveDays
                : daysInMonth - lopDays;
            const prorationFactor = Math.max(0, Math.min(1, (daysInMonth - lopDays) / daysInMonth));
            // Prorated earnings
            const proratedBasic = Math.round(salaryStruct.basic * prorationFactor);
            const proratedHra = Math.round(salaryStruct.hra * prorationFactor);
            const proratedConveyance = Math.round(salaryStruct.conveyanceAllowance * prorationFactor);
            const proratedMedical = Math.round(salaryStruct.medicalAllowance * prorationFactor);
            const proratedSpecial = Math.round(salaryStruct.specialAllowance * prorationFactor);
            const otherAllowances = Math.round(salaryStruct.otherAllowances * prorationFactor);
            const grossSalary = proratedBasic + proratedHra + proratedConveyance + proratedMedical + proratedSpecial + otherAllowances;
            const fullMonthlyGross = salaryStruct.basic + salaryStruct.hra + salaryStruct.conveyanceAllowance + salaryStruct.medicalAllowance + salaryStruct.specialAllowance + salaryStruct.otherAllowances;
            const lopDeductionAmount = Math.max(0, fullMonthlyGross - grossSalary);
            // Statutory deductions
            const epfResult = salaryStruct.epfApplicable
                ? StatutoryComplianceService_1.StatutoryComplianceService.calculateEPF(proratedBasic, salaryStruct.epfStatutoryCeiling)
                : { employeePF: 0, employerPF: 0, employerEPS: 0, employerEDLI: 0, employerAdmin: 0, totalEmployerContribution: 0 };
            const esiResult = salaryStruct.esiApplicable || grossSalary <= 21000
                ? StatutoryComplianceService_1.StatutoryComplianceService.calculateESIC(grossSalary)
                : { employeeESI: 0, employerESI: 0, totalESI: 0 };
            const pt = StatutoryComplianceService_1.StatutoryComplianceService.calculateProfessionalTax(grossSalary, salaryStruct.professionalTaxState, month);
            const tds = Number(salaryStruct.tdsMonthly || 0);
            const totalDeductions = epfResult.employeePF + esiResult.employeeESI + pt + tds;
            const netPayable = Math.max(0, grossSalary - totalDeductions);
            const gratuityProvision = Math.round(proratedBasic * 0.0481); // 4.81%
            const totalEmployerContribution = epfResult.totalEmployerContribution + esiResult.employerESI + gratuityProvision;
            // Accumulate batch totals
            batchGross += grossSalary;
            batchDeductions += totalDeductions;
            batchNet += netPayable;
            batchEmployerPF += epfResult.totalEmployerContribution;
            batchEmployerESI += esiResult.employerESI;
            batchPT += pt;
            batchTDS += tds;
            batchEmployerCost += totalEmployerContribution;
            payslipsToInsert.push({
                payslipNumber,
                batchId: batch._id,
                orgId,
                companyId: orgId,
                employeeId: emp._id,
                employee: emp._id,
                employeeCode: emp.employeeCode || `EMP-${String(emp._id).slice(-4).toUpperCase()}`,
                employeeName: emp.employeeName || `${emp.firstName} ${emp.lastName || ''}`.trim(),
                email: emp.email,
                department: emp.department || 'Operations',
                designation: emp.designation || 'Staff',
                panNumber: emp.statutoryDetails?.panNumber || '',
                uanNumber: emp.statutoryDetails?.uanNumber || '',
                pfNumber: emp.statutoryDetails?.pfNumber || '',
                esiNumber: emp.statutoryDetails?.esiNumber || '',
                bankName: emp.bankDetails?.bankName || 'HDFC Bank',
                bankAccountNumber: emp.bankDetails?.accountNumber || '50100234567890',
                ifscCode: emp.bankDetails?.ifscCode || 'HDFC0001234',
                month,
                year,
                payrollPeriod,
                totalWorkingDays: daysInMonth,
                presentDays: effectivePresent,
                paidLeaveDays,
                lopDays,
                lopDeductionAmount,
                basic: proratedBasic,
                hra: proratedHra,
                conveyanceAllowance: proratedConveyance,
                medicalAllowance: proratedMedical,
                specialAllowance: proratedSpecial,
                otherAllowances,
                grossSalary,
                epfEmployee: epfResult.employeePF,
                esiEmployee: esiResult.employeeESI,
                professionalTax: pt,
                tds,
                otherDeductions: 0,
                totalDeductions,
                netPayable,
                epfEmployer: epfResult.totalEmployerContribution,
                esiEmployer: esiResult.employerESI,
                gratuityProvision,
                totalEmployerContribution,
                status: 'Draft'
            });
        }
        // Insert all payslips
        const savedPayslips = await Payslip_1.default.insertMany(payslipsToInsert);
        // Update batch aggregates
        batch.totalEmployees = employees.length;
        batch.totalGrossPay = batchGross;
        batch.totalDeductions = batchDeductions;
        batch.totalNetPay = batchNet;
        batch.totalEmployerPF = batchEmployerPF;
        batch.totalEmployerESI = batchEmployerESI;
        batch.totalPT = batchPT;
        batch.totalTDS = batchTDS;
        batch.totalEmployerCost = batchEmployerCost;
        batch.status = 'Draft';
        await batch.save();
        return {
            batch,
            payslips: savedPayslips
        };
    }
    /**
     * Finalize and Approve Payroll Batch: Posts Journal Entry to General Ledger
     */
    static async approvePayrollBatch(batchId, approvedBy) {
        const batch = await PayrollBatch_1.default.findById(batchId);
        if (!batch)
            throw new Error('Payroll batch not found');
        if (batch.status === 'Approved' || batch.status === 'Disbursed') {
            return batch;
        }
        batch.status = 'Approved';
        batch.approvedBy = approvedBy;
        // Call PostingEngine to create GL Double-Entry Journal Entry
        await PostingEngine_1.PostingEngine.handleEvent('PAYROLL_FINALIZED', {
            companyId: batch.orgId || batch.companyId,
            orgId: batch.orgId || batch.companyId,
            batchId: batch._id.toString(),
            batchNumber: batch.batchNumber,
            grossTotal: batch.totalGrossPay,
            netTotal: batch.totalNetPay,
            employerPF: batch.totalEmployerPF,
            employerESI: batch.totalEmployerESI,
            ptTotal: batch.totalPT,
            tdsTotal: batch.totalTDS,
            deductionsTotal: batch.totalDeductions,
            date: new Date()
        });
        batch.postedToGL = true;
        batch.glJournalId = `JV-${batch.batchNumber}`;
        await batch.save();
        await Payslip_1.default.updateMany({ batchId: batch._id }, { status: 'Approved' });
        return batch;
    }
    /**
     * Disburse Payroll Batch and Post Bank Payout GL Entry
     */
    static async disbursePayrollBatch(batchId, payoutDetails) {
        const batch = await PayrollBatch_1.default.findById(batchId);
        if (!batch)
            throw new Error('Payroll batch not found');
        if (batch.status !== 'Approved') {
            throw new Error('Payroll batch must be approved before disbursement');
        }
        batch.status = 'Disbursed';
        batch.disbursementDate = payoutDetails.disbursementDate || new Date();
        batch.disbursementBank = payoutDetails.bankName;
        batch.disbursementReference = payoutDetails.referenceNumber;
        await batch.save();
        // Mark payslips as Paid
        await Payslip_1.default.updateMany({ batchId: batch._id }, {
            status: 'Paid',
            paymentDate: batch.disbursementDate,
            transactionReference: payoutDetails.referenceNumber
        });
        // Call PostingEngine for Bank Payout
        await PostingEngine_1.PostingEngine.handleEvent('PAYROLL_DISBURSED', {
            companyId: batch.orgId || batch.companyId,
            orgId: batch.orgId || batch.companyId,
            batchId: batch._id.toString(),
            netTotal: batch.totalNetPay,
            bankName: payoutDetails.bankName,
            reference: payoutDetails.referenceNumber,
            date: batch.disbursementDate
        });
        return batch;
    }
    /**
     * Generates bank disbursement batch file (HDFC, ICICI, SBI/NACH, Standard CSV)
     */
    static async generateBankDisbursementFile(batchId, format = 'HDFC') {
        const batch = await PayrollBatch_1.default.findById(batchId);
        if (!batch)
            throw new Error('Payroll batch not found');
        const payslips = await Payslip_1.default.find({ batchId });
        if (format === 'HDFC') {
            // HDFC Bank Bulk Transfer format
            const header = 'Beneficiary Account No,Amount,Beneficiary Name,Payment Date,IFSC Code,Remarks';
            const rows = payslips.map(p => {
                const acc = p.bankAccountNumber || '50100000000000';
                const amount = p.netPayable.toFixed(2);
                const name = (p.employeeName || 'Staff').replace(/,/g, '');
                const date = new Date().toISOString().slice(0, 10);
                const ifsc = p.ifscCode || 'HDFC0000001';
                const remarks = `Salary_${p.payrollPeriod.replace(/\s+/g, '_')}`;
                return `${acc},${amount},${name},${date},${ifsc},${remarks}`;
            });
            return [header, ...rows].join('\r\n');
        }
        if (format === 'ICICI') {
            // ICICI Bank Bulk Payout format
            const header = 'Py_Mode,Debit_Acc,Bene_Acc,Bene_Name,Amount,Txn_Date,IFSC,Bene_Email,Remarks';
            const rows = payslips.map(p => {
                const acc = p.bankAccountNumber || '000000000000';
                const amount = p.netPayable.toFixed(2);
                const name = (p.employeeName || 'Staff').replace(/,/g, '');
                const date = new Date().toISOString().slice(0, 10);
                const ifsc = p.ifscCode || 'ICIC0000001';
                return `NEFT,000105000000,${acc},${name},${amount},${date},${ifsc},${p.email},Salary Payout`;
            });
            return [header, ...rows].join('\r\n');
        }
        // Default Standard CSV
        const header = 'Employee_Code,Employee_Name,Bank_Name,Account_Number,IFSC_Code,Net_Pay,Payment_Status';
        const rows = payslips.map(p => {
            return `${p.employeeCode},"${p.employeeName}","${p.bankName}","${p.bankAccountNumber}","${p.ifscCode}",${p.netPayable},${p.status}`;
        });
        return [header, ...rows].join('\r\n');
    }
}
exports.PayrollService = PayrollService;

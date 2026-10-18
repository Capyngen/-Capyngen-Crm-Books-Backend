import { Request, Response } from 'express';
import PayrollBatch from '../models/PayrollBatch';
import Payslip from '../models/Payslip';
import { PayrollService } from '../services/PayrollService';
import { StatutoryComplianceService } from '../services/StatutoryComplianceService';

export const processPayrollBatch = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId || req.body.companyId || 'SYSTEM';
    const month = Number(req.body.month);
    const year = Number(req.body.year || new Date().getFullYear());
    const processedBy = (req as any).user?.email || 'Payroll Admin';

    if (!month || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'Valid month (1-12) is required' });
    }

    const result = await PayrollService.runPayrollBatch(orgId, month, year, processedBy);
    res.status(201).json({
      success: true,
      message: `Payroll processed successfully for ${result.batch.payrollPeriod}`,
      data: result.batch,
      payslipsCount: result.payslips.length
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Payroll processing failed' });
  }
};

export const getPayrollBatches = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.query.orgId || req.query.companyId;
    const query: any = {};
    if (orgId) {
      query.$or = [{ orgId }, { companyId: orgId }];
    }
    if (req.query.year) {
      query.year = Number(req.query.year);
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const batches = await PayrollBatch.find(query).sort({ year: -1, month: -1 });
    res.json({ success: true, data: batches, count: batches.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getPayrollBatchById = async (req: Request, res: Response) => {
  try {
    const batch = await PayrollBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Payroll batch not found' });
    }

    const payslips = await Payslip.find({ batchId: batch._id }).sort({ employeeCode: 1 });
    res.json({
      success: true,
      data: {
        batch,
        payslips
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const approvePayrollBatch = async (req: Request, res: Response) => {
  try {
    const approvedBy = (req as any).user?.email || 'Finance Manager';
    const batch = await PayrollService.approvePayrollBatch(req.params.id as string, approvedBy);
    res.json({
      success: true,
      message: `Payroll batch ${batch.batchNumber} approved and posted to General Ledger`,
      data: batch
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Approval failed' });
  }
};

export const disbursePayrollBatch = async (req: Request, res: Response) => {
  try {
    const { bankName, referenceNumber, disbursementDate } = req.body;
    if (!bankName || !referenceNumber) {
      return res.status(400).json({ success: false, message: 'Bank name and reference number are required' });
    }

    const batch = await PayrollService.disbursePayrollBatch(req.params.id as string, {
      bankName,
      referenceNumber,
      disbursementDate: disbursementDate ? new Date(disbursementDate) : new Date()
    });

    res.json({
      success: true,
      message: `Payroll batch disbursed and reconciled against Bank in General Ledger`,
      data: batch
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Disbursement failed' });
  }
};

export const downloadBankDisbursementFile = async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as any) || 'HDFC';
    const csvContent = await PayrollService.generateBankDisbursementFile(req.params.id as string, format);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="disbursement_${req.params.id}_${format}.csv"`);
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Bank file generation failed' });
  }
};

export const downloadEPF_ECRFile = async (req: Request, res: Response) => {
  try {
    const payslips = await Payslip.find({ batchId: req.params.id as string });
    if (!payslips || payslips.length === 0) {
      return res.status(404).json({ success: false, message: 'No payslips found for this batch' });
    }

    const ecrText = StatutoryComplianceService.generateEPF_ECRFile(payslips);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="EPF_ECR_${req.params.id}.txt"`);
    res.status(200).send(ecrText);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'ECR generation failed' });
  }
};

export const downloadESICReturn = async (req: Request, res: Response) => {
  try {
    const payslips = await Payslip.find({ batchId: req.params.id as string });
    if (!payslips || payslips.length === 0) {
      return res.status(404).json({ success: false, message: 'No payslips found for this batch' });
    }

    const esicCsv = StatutoryComplianceService.generateESICReturn(payslips);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ESIC_Return_${req.params.id}.csv"`);
    res.status(200).send(esicCsv);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'ESIC return generation failed' });
  }
};

export const getPayslipById = async (req: Request, res: Response) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }
    res.json({ success: true, data: payslip });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

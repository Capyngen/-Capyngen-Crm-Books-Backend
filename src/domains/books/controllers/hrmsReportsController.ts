import { Request, Response } from 'express';
import PayrollBatch from '../models/PayrollBatch';
import Payslip from '../models/Payslip';
import TimeEntry from '../models/TimeEntry';
import Employee from '../models/Employee';

export const getDepartmentPayrollSummary = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.query.orgId || req.query.companyId;
    const month = Number(req.query.month || new Date().getMonth() + 1);
    const year = Number(req.query.year || new Date().getFullYear());

    const query: any = { month, year };
    if (orgId) {
      query.$or = [{ orgId }, { companyId: orgId }];
    }

    const payslips = await Payslip.find(query);

    const deptMap = new Map<string, any>();

    for (const p of payslips) {
      const dept = p.department || 'Operations';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, {
          department: dept,
          employeeCount: 0,
          grossSalary: 0,
          totalDeductions: 0,
          netPayable: 0,
          employerPF: 0,
          employerESI: 0,
          totalEmployerCost: 0
        });
      }

      const item = deptMap.get(dept);
      item.employeeCount += 1;
      item.grossSalary += p.grossSalary || 0;
      item.totalDeductions += p.totalDeductions || 0;
      item.netPayable += p.netPayable || 0;
      item.employerPF += p.epfEmployer || 0;
      item.employerESI += p.esiEmployer || 0;
      item.totalEmployerCost += p.totalEmployerContribution || 0;
    }

    res.json({
      success: true,
      month,
      year,
      data: Array.from(deptMap.values())
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getTimesheetProfitabilityReport = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.query.orgId || req.query.companyId;
    const query: any = {};
    if (orgId) {
      query.orgId = orgId;
    }
    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    }
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(String(req.query.startDate)),
        $lte: new Date(String(req.query.endDate))
      };
    }

    const entries = await TimeEntry.find(query)
      .populate('employeeId', 'employeeName employeeCode department')
      .populate('projectId', 'projectName projectCode clientName');

    const projectMap = new Map<string, any>();

    for (const e of entries as any[]) {
      const projId = e.projectId?._id?.toString() || 'General';
      const projName = e.projectId?.projectName || 'Internal Operations';

      if (!projectMap.has(projId)) {
        projectMap.set(projId, {
          projectId: projId,
          projectName: projName,
          totalHours: 0,
          billableHours: 0,
          directLaborCost: 0,
          billingRevenue: 0,
          grossMargin: 0,
          grossMarginPct: 0
        });
      }

      const p = projectMap.get(projId);
      const hours = Number(e.hours || 0);
      const costRate = Number(e.costRate || 0);
      const billingRate = Number(e.billingRate || 0);

      p.totalHours += hours;
      if (e.isBillable) {
        p.billableHours += hours;
        p.billingRevenue += hours * billingRate;
      }
      p.directLaborCost += hours * costRate;
    }

    projectMap.forEach(p => {
      p.grossMargin = p.billingRevenue - p.directLaborCost;
      p.grossMarginPct = p.billingRevenue > 0 ? Math.round((p.grossMargin / p.billingRevenue) * 10000) / 100 : 0;
    });

    res.json({
      success: true,
      data: Array.from(projectMap.values())
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getStatutoryComplianceReport = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.query.orgId || req.query.companyId;
    const month = Number(req.query.month || new Date().getMonth() + 1);
    const year = Number(req.query.year || new Date().getFullYear());

    const query: any = { month, year };
    if (orgId) {
      query.$or = [{ orgId }, { companyId: orgId }];
    }

    const payslips = await Payslip.find(query);

    let totalEPFEmployee = 0;
    let totalEPFEmployer = 0;
    let totalESIEmployee = 0;
    let totalESIEmployer = 0;
    let totalPT = 0;
    let totalTDS = 0;

    for (const p of payslips) {
      totalEPFEmployee += p.epfEmployee || 0;
      totalEPFEmployer += p.epfEmployer || 0;
      totalESIEmployee += p.esiEmployee || 0;
      totalESIEmployer += p.esiEmployer || 0;
      totalPT += p.professionalTax || 0;
      totalTDS += p.tds || 0;
    }

    res.json({
      success: true,
      month,
      year,
      summary: {
        epf: {
          employeeContribution: totalEPFEmployee,
          employerContribution: totalEPFEmployer,
          totalEPFLiability: totalEPFEmployee + totalEPFEmployer,
          challanDueDate: `${year}-${String(month + 1).padStart(2, '0')}-15`
        },
        esic: {
          employeeContribution: totalESIEmployee,
          employerContribution: totalESIEmployer,
          totalESICLiability: totalESIEmployee + totalESIEmployer,
          challanDueDate: `${year}-${String(month + 1).padStart(2, '0')}-15`
        },
        professionalTax: {
          totalPTLiability: totalPT,
          challanDueDate: `${year}-${String(month + 1).padStart(2, '0')}-20`
        },
        tds: {
          totalTDSLiability: totalTDS,
          challanDueDate: `${year}-${String(month + 1).padStart(2, '0')}-07`
        },
        totalStatutoryLiabilities: totalEPFEmployee + totalEPFEmployer + totalESIEmployee + totalESIEmployer + totalPT + totalTDS
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getPayrollVarianceReport = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.query.orgId || req.query.companyId;
    const currentMonth = Number(req.query.currentMonth || new Date().getMonth() + 1);
    const currentYear = Number(req.query.currentYear || new Date().getFullYear());

    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;
    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear = currentYear - 1;
    }

    const currentBatch = await PayrollBatch.findOne({
      $or: [{ orgId }, { companyId: orgId }],
      month: currentMonth,
      year: currentYear
    });

    const previousBatch = await PayrollBatch.findOne({
      $or: [{ orgId }, { companyId: orgId }],
      month: previousMonth,
      year: previousYear
    });

    const currGross = currentBatch?.totalGrossPay || 0;
    const prevGross = previousBatch?.totalGrossPay || 0;
    const grossVariance = currGross - prevGross;

    const currNet = currentBatch?.totalNetPay || 0;
    const prevNet = previousBatch?.totalNetPay || 0;
    const netVariance = currNet - prevNet;

    const currEmployees = currentBatch?.totalEmployees || 0;
    const prevEmployees = previousBatch?.totalEmployees || 0;

    res.json({
      success: true,
      currentPeriod: `${currentMonth}/${currentYear}`,
      previousPeriod: `${previousMonth}/${previousYear}`,
      variance: {
        headcountDelta: currEmployees - prevEmployees,
        grossSalaryDelta: grossVariance,
        grossSalaryDeltaPct: prevGross > 0 ? Math.round((grossVariance / prevGross) * 10000) / 100 : 0,
        netPayDelta: netVariance,
        currentBatch,
        previousBatch
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

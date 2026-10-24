import { AdvancedReportsService } from '../services/advancedReportsService';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import LedgerEntry from '../models/LedgerEntry';
import Invoice from '../../billing/models/Invoice';
import Bill from '../../inventory/models/Bill';
import Expense from '../models/Expense';
import { requestContext } from '../../../context';
import https from 'https';

// Live Forex exchange rate cache
let cachedForex: { rate: number; date: string; fetchedAt: number } | null = null;

export const getLiveForexRate = async (base = 'USD', target = 'INR'): Promise<{ rate: number; date: string }> => {
  const now = Date.now();
  // Cache for 15 minutes to avoid excessive external network calls
  if (cachedForex && (now - cachedForex.fetchedAt) < 15 * 60 * 1000) {
    return { rate: cachedForex.rate, date: cachedForex.date };
  }

  try {
    const fetchPromise = new Promise<{ rate: number; date: string }>((resolve) => {
      const req = https.get(`https://open.er-api.com/v6/latest/${base}`, { timeout: 3000 }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            if (json && json.rates && json.rates[target]) {
              const liveRate = Number(Number(json.rates[target]).toFixed(2));
              const dateStr = json.time_last_update_utc || new Date().toUTCString();
              resolve({ rate: liveRate, date: dateStr });
            } else {
              resolve({ rate: 95.32, date: new Date().toUTCString() });
            }
          } catch (e) {
            resolve({ rate: 95.32, date: new Date().toUTCString() });
          }
        });
      });
      req.on('error', () => resolve({ rate: 95.32, date: new Date().toUTCString() }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ rate: 95.32, date: new Date().toUTCString() });
      });
    });

    const result = await fetchPromise;
    cachedForex = { rate: result.rate, date: result.date, fetchedAt: now };
    return result;
  } catch (err) {
    return { rate: 95.32, date: new Date().toUTCString() };
  }
};

// Multi-tenant resolver: extracts the active company from Subdomain, x-org-id header, token or context
export const resolveTargetCompany = async (req: Request) => {
  const db = mongoose.connection.db;
  if (!db) return null;

  // 1. Check Subdomain (from x-subdomain header, origin, referer, or host)
  const xSubdomain = (req.headers['x-subdomain'] as string) || '';
  const origin = (req.headers.origin as string) || (req.headers.referer as string) || '';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';

  let subdomain = xSubdomain ? xSubdomain.trim().toLowerCase() : '';
  if (!subdomain && origin) {
    const originMatch = origin.match(/https?:\/\/([a-zA-Z0-9_-]+)\.books\.orinite\.com/);
    if (originMatch && originMatch[1] && originMatch[1] !== 'books') {
      subdomain = originMatch[1].toLowerCase();
    }
  }
  if (!subdomain && host) {
    const hostMatch = String(host).match(/^([a-zA-Z0-9_-]+)\.books\.orinite\.com/);
    if (hostMatch && hostMatch[1] && hostMatch[1] !== 'books') {
      subdomain = hostMatch[1].toLowerCase();
    }
  }

  if (subdomain) {
    const comp = await db.collection('companyprofiles').findOne({ subdomain });
    if (comp) return comp;
  }

  // 2. Check x-org-id, x-company-id, or x-organization-id header
  const headerOrgId = (req.headers['x-org-id'] || req.headers['x-company-id'] || req.headers['x-organization-id']) as string;
  if (headerOrgId && mongoose.Types.ObjectId.isValid(headerOrgId)) {
    const comp = await db.collection('companyprofiles').findOne({ _id: new mongoose.Types.ObjectId(headerOrgId) });
    if (comp) return comp;
  }

  // 3. Check (req as any).org?._id or requestContext
  const ctxOrgId = (req as any).org?._id || requestContext.getStore()?.orgId;
  if (ctxOrgId && mongoose.Types.ObjectId.isValid(ctxOrgId)) {
    const comp = await db.collection('companyprofiles').findOne({ _id: new mongoose.Types.ObjectId(ctxOrgId) });
    if (comp) return comp;
  }

  // 4. Check query params (companyId, orgId, organizationId)
  const queryCompanyId = (req.query.companyId || req.query.orgId || req.query.organizationId) as string;
  if (queryCompanyId && mongoose.Types.ObjectId.isValid(queryCompanyId)) {
    const comp = await db.collection('companyprofiles').findOne({ _id: new mongoose.Types.ObjectId(queryCompanyId) });
    if (comp) return comp;
  }

  return null;
};

export const extractOrgId = async (req: Request): Promise<string> => {
  const comp = await resolveTargetCompany(req);
  if (comp?._id) return String(comp._id);
  const headerOrgId = (req.headers['x-org-id'] || req.headers['x-company-id'] || req.headers['x-organization-id']) as string;
  if (headerOrgId) return headerOrgId;
  const ctxOrgId = (req as any).org?._id || requestContext.getStore()?.orgId;
  if (ctxOrgId) return String(ctxOrgId);
  const qId = (req.query.companyId || req.query.orgId || req.query.organizationId) as string;
  if (qId) return qId;
  return 'SYSTEM';
};

// ERP-grade role & privilege check for confidential payroll access
export const checkPayrollAccess = async (req: Request): Promise<{ allowed: boolean; role: string; designation?: string }> => {
  const db = mongoose.connection.db;
  const currentUser = (req as any).user;
  const rawRole = (currentUser?.role || '').trim().toLowerCase();

  let userDesignationName = '';
  if (currentUser?.designation && db) {
    try {
      const desigDoc = await db.collection('designations').findOne({ _id: new mongoose.Types.ObjectId(currentUser.designation) });
      if (desigDoc) {
        userDesignationName = (desigDoc.designationName || desigDoc.name || desigDoc.title || '').toLowerCase();
      }
    } catch (e) {}
  } else if (currentUser?._id && db) {
    try {
      const empDoc = await db.collection('employees').findOne({ _id: new mongoose.Types.ObjectId(currentUser._id) });
      if (empDoc?.designation) {
        const desigDoc = await db.collection('designations').findOne({ _id: new mongoose.Types.ObjectId(empDoc.designation) });
        if (desigDoc) {
          userDesignationName = (desigDoc.designationName || desigDoc.name || desigDoc.title || '').toLowerCase();
        }
      }
    } catch (e) {}
  }

  // Authorized roles/keywords: Admin, HR Head, HR, Senior Accountant, Accountant, Finance, CFO
  const authorizedKeywords = [
    'admin',
    'superadmin',
    'owner',
    'hr',
    'hr head',
    'hr manager',
    'hr & admin head',
    'fr-hrm',
    'accountant',
    'senior accountant',
    'sr. accountant',
    'accounts manager',
    'finance',
    'finance manager',
    'chief financial officer',
    'cfo',
    'payroll manager',
    'payroll'
  ];

  // If in dev mode without token/user, default to Admin for local curl/testing, otherwise enforce
  if (!currentUser && process.env.NODE_ENV === 'development') {
    return { allowed: true, role: 'Admin (Dev Mode)' };
  }

  const matchesRole = authorizedKeywords.some(keyword =>
    rawRole === keyword || rawRole.includes(keyword)
  );

  const matchesDesignation = authorizedKeywords.some(keyword =>
    userDesignationName === keyword || userDesignationName.includes(keyword)
  );

  const allowed = matchesRole || matchesDesignation;

  return {
    allowed,
    role: currentUser?.role || 'Employee',
    designation: userDesignationName || undefined
  };
};

// Utility to process balances
const getAccountBalances = async (orgId: string) => {
  const entries = await LedgerEntry.find({ orgId, status: 'Posted' });
  const balances: Record<string, { debit: number, credit: number, net: number }> = {};
  
  entries.forEach(entry => {
    entry.lines.forEach(line => {
      const acc = String(line.accountId);
      if (!balances[acc]) balances[acc] = { debit: 0, credit: 0, net: 0 };
      balances[acc].debit += line.debit || 0;
      balances[acc].credit += line.credit || 0;
      balances[acc].net += (line.debit || 0) - (line.credit || 0);
    });
  });
  return balances;
};






export const getTrialBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getTrialBalance(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getGeneralLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getGeneralLedger(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getJournalReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getJournalReport(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};







export const getDayBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getDayBook(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getAccountTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getAccountTransactions(orgId, req.query.accountId as string);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getAccountTypeSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getAccountTypeSummary(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getDetailedGeneralLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getDetailedGeneralLedger(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getProfitAndLoss = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = mongoose.connection.db;
    const comp = await resolveTargetCompany(req);
    const targetCompanyId = comp ? comp._id : null;
    const orgId = String(targetCompanyId || (req as any).org?._id || (req.headers['x-org-id'] as string) || requestContext.getStore()?.orgId || 'SYSTEM');
    const orgFilter = { $or: [{ orgId }, { companyId: orgId }] };

    // 1. Live Sales Revenue from posted Invoices
    const invoices = await Invoice.find({ ...orgFilter, status: { $nin: ['Draft', 'Void'] } }).lean();
    const liveSalesTotal = invoices.reduce((s: number, inv: any) => s + (inv.total || inv.amount || 0), 0);

    // 2. Live COGS from posted Vendor Bills
    const bills = await Bill.find({ ...orgFilter, status: { $nin: ['Draft', 'Void'] } }).lean();
    const liveBillsTotal = bills.reduce((s: number, b: any) => s + (b.total || b.amount || 0), 0);

    // 3. Live Operating Expenses from Expenses
    const expenses = await Expense.find({ ...orgFilter, status: { $ne: 'Void' } }).lean();
    const liveExpensesTotal = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);

    const expCategoryMap: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const cat = e.category || 'General & Administrative';
      expCategoryMap[cat] = (expCategoryMap[cat] || 0) + (e.amount || 0);
    });

    // 4. Live Payroll from HRMS Payroll Records
    let payrollTotal = 0;
    if (db && targetCompanyId) {
      try {
        const requestedMonth = (req.query.month as string) || 'OCT';
        const payrollQuery: any = { 
          companyId: targetCompanyId,
          month: requestedMonth.toUpperCase() 
        };
        const payrollRecords = await db.collection('payrollrecords').find(payrollQuery).toArray();
        payrollTotal = payrollRecords.reduce((sum: number, r: any) => sum + (r.grossSalary || 0), 0);
      } catch (err) {
        console.warn('Could not aggregate payroll records:', err);
      }
    }

    const operatingIncomeTotal = liveSalesTotal;
    const cogsTotal = liveBillsTotal;
    const grossProfit = operatingIncomeTotal - cogsTotal;
    const otherExpensesTotal = liveExpensesTotal;
    const operatingExpensesTotal = payrollTotal + otherExpensesTotal;
    const netProfit = grossProfit - operatingExpensesTotal;

    const hrmsCurrency = comp?.currency ? comp.currency.toUpperCase() : 'USD';
    const hrmsSymbol = hrmsCurrency === 'USD' ? '$' : hrmsCurrency === 'INR' ? '₹' : hrmsCurrency === 'EUR' ? '€' : '£';
    const targetCurrency = hrmsCurrency === 'USD' ? 'INR' : 'USD';
    const targetSymbol = hrmsCurrency === 'USD' ? '₹' : '$';

    const forex = await getLiveForexRate('USD', 'INR');
    const liveExchangeRate = forex.rate;
    const liveExchangeRateDate = forex.date;

    const authCheck = await checkPayrollAccess(req);

    const accounts: any[] = [
      {
        accountId: 'income-sales',
        accountCode: 'INC-4001',
        accountName: 'Sales Revenue',
        category: 'Operating Income',
        amount: liveSalesTotal
      },
      {
        accountId: 'cogs-inventory',
        accountCode: 'COGS-5001',
        accountName: 'Direct Cost of Goods Sold (Purchases)',
        category: 'Cost of Goods Sold',
        amount: liveBillsTotal
      },
      {
        accountId: 'salaries-and-employee-expenses',
        accountCode: 'EXP-5001',
        accountName: 'Salaries and Employee Expenses',
        category: 'Operating Expenses',
        amount: payrollTotal
      }
    ];

    Object.entries(expCategoryMap).forEach(([catName, catAmt], idx) => {
      accounts.push({
        accountId: `expense-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        accountCode: `EXP-50${10 + idx}`,
        accountName: catName,
        category: 'Operating Expenses',
        amount: catAmt
      });
    });

    const data: any = {
      canAccessPayroll: authCheck.allowed,
      currentUserRole: authCheck.role,
      companyId: targetCompanyId ? targetCompanyId.toString() : null,
      companyName: comp?.companyName || comp?.name || 'Company',
      currency: hrmsCurrency,
      currencySymbol: hrmsSymbol,
      targetCurrency,
      targetCurrencySymbol: targetSymbol,
      exchangeRate: liveExchangeRate,
      exchangeRateDate: liveExchangeRateDate,
      operatingIncome: {
        total: operatingIncomeTotal,
        breakdown: {
          'Sales Revenue': liveSalesTotal
        }
      },
      costOfGoodsSold: {
        total: cogsTotal,
        breakdown: {
          'Direct Cost of Goods Sold': liveBillsTotal
        }
      },
      grossProfit,
      operatingExpenses: {
        total: operatingExpensesTotal,
        breakdown: {
          'Salaries and Employee Expenses': payrollTotal,
          ...expCategoryMap
        }
      },
      netProfit,
      accounts
    };

    res.status(200).json({ success: true, message: 'Request successful', data });
  } catch (error) { next(error); }
};

export const getPayrollDrilldownReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ERP-GRADE PRIVILEGE & ROLE VERIFICATION
    const authCheck = await checkPayrollAccess(req);
    if (!authCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not have permission to view confidential company payroll reports. Only Admin, HR, and Finance personnel are authorized to view compensation data.',
        data: {
          code: 'PERMISSION_DENIED',
          requiredRoles: ['Admin', 'HR Head', 'HR', 'Accountant', 'Senior Accountant', 'Finance Manager', 'CFO'],
          currentRole: authCheck.role
        }
      });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database connection unavailable' });
    }

    // STRICT MULTI-TENANT ISOLATION: Resolve company dynamically
    const comp = await resolveTargetCompany(req);
    const targetCompanyId = comp ? comp._id : null;

    const requestedMonth = (req.query.month as string) || 'OCT';
    const requestedYear = req.query.year ? Number(req.query.year) : 2026;

    // 1. Available periods in the database scoped strictly to this target company
    const periodFilter: any = {};
    if (targetCompanyId) {
      periodFilter.companyId = targetCompanyId;
    }
    const distinctMonths: string[] = targetCompanyId ? await db.collection('payrollrecords').distinct('month', periodFilter) : [];
    const MONTH_ORDER = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const availablePeriods = (distinctMonths.length > 0 ? distinctMonths : ['OCT'])
      .sort((a, b) => MONTH_ORDER.indexOf(b) - MONTH_ORDER.indexOf(a))
      .map(m => ({
        month: m,
        year: 2026,
        label: `${m} 2026`
      }));

    // 2. Query payroll records strictly scoped to targetCompanyId
    const query: any = {};
    if (targetCompanyId) {
      query.companyId = targetCompanyId;
    } else {
      query.companyId = new mongoose.Types.ObjectId('000000000000000000000000');
    }

    if (requestedMonth && requestedMonth !== 'ALL') {
      query.month = requestedMonth.toUpperCase();
    }
    if (requestedYear) {
      query.year = requestedYear;
    }

    // STRICT TENANT ISOLATION: No fallback to other companies!
    const records = await db.collection('payrollrecords').find(query).toArray();

    // 3. Fetch Employees & Designations strictly for these records
    const empIds = records.map(r => r.employee).filter(Boolean);
    const employees = empIds.length > 0 ? await db.collection('employees').find({ _id: { $in: empIds } }).toArray() : [];
    const empMap = new Map<string, any>();
    employees.forEach(e => empMap.set(e._id.toString(), e));

    const desigIds = employees.map(e => e.designation).filter(Boolean);
    const designations = desigIds.length > 0 ? await db.collection('designations').find({ _id: { $in: desigIds } }).toArray() : [];
    const desigMap = new Map<string, string>();
    designations.forEach(d => desigMap.set(d._id.toString(), d.designationName || d.name || d.title));

    // 4. Calculate Aggregate Metrics
    const totalGross = records.reduce((s, r) => s + (r.grossSalary || 0), 0);
    const totalNet = records.reduce((s, r) => s + (r.netPayable || 0), 0);
    const totalLop = records.reduce((s, r) => s + (r.totalLop || 0), 0);
    const totalPf = records.reduce((s, r) => s + (r.pfDeduction || 0), 0);
    const totalEsi = records.reduce((s, r) => s + (r.esiDeduction || 0), 0);
    const totalPt = records.reduce((s, r) => s + (r.ptDeduction || 0), 0);
    const totalLwf = records.reduce((s, r) => s + (r.lwfEmployee || 0), 0);
    const totalTds = records.reduce((s, r) => s + (r.taxDeducted || 0), 0);
    const totalStatutory = totalPf + totalEsi + totalPt + totalLwf + totalTds;
    const totalDeductions = totalLop + totalStatutory;

    const totalEmployerContribPure = records.reduce(
      (s, r) => s + (r.employerPfContribution || 0) + (r.employerEsiContribution || 0) + (r.lwfEmployer || 0) + (r.employerPfAdminCharges || 0),
      0
    );
    const totalGratuity = records.reduce((s, r) => s + (r.gratuityProvision || 0), 0);
    const totalEmployerCost = totalEmployerContribPure + totalGratuity;
    const totalCostToCompany = totalGross + totalEmployerCost;

    const tdsCount = records.filter(r => (r.taxDeducted || 0) > 0).length;
    const pfCount = records.filter(r => (r.pfDeduction || 0) > 0 || (r.esiDeduction || 0) > 0 || (r.ptDeduction || 0) > 0).length;
    const lopCount = records.filter(r => (r.totalLop || 0) > 0).length;

    const hrmsCurrency = comp?.currency ? comp.currency.toUpperCase() : 'USD';
    const hrmsSymbol = hrmsCurrency === 'USD' ? '$' : hrmsCurrency === 'INR' ? '₹' : hrmsCurrency === 'EUR' ? '€' : '£';
    const targetCurrency = hrmsCurrency === 'USD' ? 'INR' : 'USD';
    const targetSymbol = hrmsCurrency === 'USD' ? '₹' : '$';

    const forex = await getLiveForexRate('USD', 'INR');
    const liveExchangeRate = forex.rate;
    const liveExchangeRateDate = forex.date;

    // 5. Map employee items
    const employeeItems = records.map(r => {
      const emp = empMap.get(r.employee?.toString());
      const desigName = emp?.designation ? desigMap.get(emp.designation.toString()) || 'Staff' : (emp?.jobTitle || 'Staff');
      const gross = r.grossSalary || 0;
      const net = r.netPayable || 0;
      const lop = r.totalLop || 0;
      const pf = r.pfDeduction || 0;
      const pt = r.ptDeduction || 0;
      const lwf = r.lwfEmployee || 0;
      const tds = r.taxDeducted || 0;
      const esi = r.esiDeduction || 0;
      
      const deductions = lop + pf + pt + lwf + tds + esi;
      const statutoryDeductions = pf + pt + lwf + tds + esi;

      const employerPf = r.employerPfContribution || 0;
      const employerEsi = r.employerEsiContribution || 0;
      const employerLwf = r.lwfEmployer || 0;
      const employerPfAdmin = r.employerPfAdminCharges || 0;
      const employerContrib = employerPf + employerEsi + employerLwf + employerPfAdmin;
      const gratuity = r.gratuityProvision || 0;

      return {
        id: r._id.toString(),
        employeeId: r.employee?.toString(),
        name: emp ? `${emp.firstName} ${emp.lastName || ''}`.trim() : 'Staff Member',
        email: emp?.email || 'N/A',
        code: emp?.employeeId || emp?.employeeCode || emp?.empId || `EMP-${String(r.employee).slice(-4).toUpperCase()}`,
        designation: desigName,
        department: emp?.department || 'Operations',
        month: r.month,
        year: r.year,
        grossSalary: gross,
        netPayable: net,
        lopAmount: lop,
        taxDeducted: tds,
        pfDeduction: pf,
        esiDeduction: esi,
        ptDeduction: pt,
        lwfEmployee: lwf,
        totalDeductions: deductions,
        statutoryDeductions,
        employerContribution: {
          pf: employerPf,
          esi: employerEsi,
          lwf: employerLwf,
          pfAdmin: employerPfAdmin,
          total: employerContrib
        },
        employerProvisions: {
          gratuity
        },
        totalEmployerCost: employerContrib + gratuity,
        totalCostToCompany: gross + employerContrib + gratuity,
        status: r.status || 'Processed',
        fixedEarningsBreakdown: (r.fixedEarningsBreakdown || []).map((e: any) => ({
          name: e.name,
          amount: e.amount || 0,
          isFixed: e.isFixed !== undefined ? e.isFixed : true
        })),
        attendance: {
          totalWorkingDays: r.totalWorkingDays || 31,
          presentDays: r.presentDays !== undefined ? r.presentDays : 0,
          absentDays: r.absentDays !== undefined ? r.absentDays : 0,
          absentDates: r.absentDates || [],
          approvedLeaves: r.totalApprovedLeaves || 0,
          paidLeaves: r.paidLeaves || 0,
          unpaidLeaves: r.unpaidLeaves || 0,
          lopDays: r.lopDays || 0,
          lopAmount: lop
        }
      };
    });

    // 6. Balanced Journal Voucher
    const journalVoucher = {
      voucherNumber: `JV-PAYROLL-${requestedMonth}-${requestedYear}`,
      date: `${requestedYear}-${requestedMonth === 'OCT' ? '10-31' : requestedMonth === 'SEP' ? '09-30' : '07-31'}`,
      narration: `Being aggregated salary and statutory expenses for ${requestedMonth} ${requestedYear} processed via HRMS for ${comp?.companyName || 'Company'}`,
      status: 'Posted',
      totalDebit: totalCostToCompany,
      totalCredit: totalCostToCompany,
      isBalanced: true,
      lines: [
        {
          accountCode: 'EXP-5001',
          accountName: 'Salaries & Wages Expense',
          type: 'Debit',
          debit: totalGross,
          credit: 0
        },
        {
          accountCode: 'EXP-5002',
          accountName: 'Employer Statutory Contribution (PF/ESI/EDLI/Gratuity)',
          type: 'Debit',
          debit: totalEmployerCost,
          credit: 0
        },
        {
          accountCode: 'LIAB-2010',
          accountName: 'Salaries Payable (Disbursement Clearing)',
          type: 'Credit',
          debit: 0,
          credit: totalNet
        },
        {
          accountCode: 'LIAB-2020',
          accountName: 'TDS Payable u/s 192 (Withholding Tax)',
          type: 'Credit',
          debit: 0,
          credit: totalTds
        },
        {
          accountCode: 'LIAB-2030',
          accountName: 'PF & Statutory Dues Payable',
          type: 'Credit',
          debit: 0,
          credit: totalCostToCompany - (totalNet + totalTds)
        }
      ]
    };

    res.status(200).json({
      success: true,
      message: 'Payroll drilldown data retrieved successfully',
      data: {
        companyId: targetCompanyId ? targetCompanyId.toString() : null,
        companyName: comp?.companyName || comp?.name || 'Company',
        currency: hrmsCurrency,
        currencySymbol: hrmsSymbol,
        targetCurrency,
        targetCurrencySymbol: targetSymbol,
        exchangeRate: liveExchangeRate,
        exchangeRateDate: liveExchangeRateDate,
        selectedMonth: requestedMonth,
        selectedYear: requestedYear,
        availablePeriods,
        canAccessPayroll: authCheck.allowed,
        currentUserRole: authCheck.role,
        summary: {
          totalGross,
          totalNet,
          totalLop,
          totalTds,
          totalPf,
          totalEsi,
          totalPt,
          totalLwf,
          totalStatutory,
          totalDeductions,
          totalEmployerContribution: totalEmployerContribPure,
          totalGratuity,
          totalEmployerCost,
          totalCostToCompany,
          employeeCount: records.length,
          tdsCount,
          pfCount,
          lopCount
        },
        employees: employeeItems,
        journalVoucher
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBalanceSheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getBalanceSheet(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getCashFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getCashFlowStatement(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getHorizontalPL = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getHorizontalPL(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getHorizontalBS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getHorizontalBS(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getBusinessPerformanceRatios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getBusinessPerformanceRatios(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getMovementOfEquity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = await extractOrgId(req);
    const data = await AdvancedReportsService.getMovementOfEquity(orgId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};


export const getSalesBySalesPerson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getSalesBySalesPerson(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getSalesSummaryByDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getSalesSummaryByDate(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getProfitByItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = requestContext.getStore()?.orgId || 'SYSTEM';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const data = await AdvancedReportsService.getProfitByItem(orgId, startDate, endDate);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

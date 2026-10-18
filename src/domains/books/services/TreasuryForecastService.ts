import BankAccount from '../models/BankAccount';
import Invoice from '../../billing/models/Invoice';
import Bill from '../../inventory/models/Bill';
import PayrollBatch from '../models/PayrollBatch';
import RecurringExpense from '../models/RecurringExpense';

export interface ICashBucket {
  period: string; // 'Overdue' | '0-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days'
  inflows: number;
  outflows: number;
  net: number;
}

export interface IDailyCashCurvePoint {
  date: string;
  inflows: number;
  outflows: number;
  closingBalance: number;
}

export class TreasuryForecastService {
  static async getTreasuryForecast(orgId: string, horizonDays: number = 90) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Current Available Liquidity
    const bankAccounts = await BankAccount.find({ orgId, status: 'Active' }).lean();
    let totalBankCash = 0;
    let totalCreditCardDebt = 0;

    for (const acc of bankAccounts) {
      if (acc.accountType === 'CreditCard') {
        totalCreditCardDebt += acc.currentBalance || 0;
      } else {
        totalBankCash += acc.currentBalance || 0;
      }
    }

    const startingCash = totalBankCash - totalCreditCardDebt;

    // 2. Scheduled AR Inflows (Unpaid Invoices)
    const openInvoices: any[] = await (Invoice.find({
      orgId,
      status: { $in: ['Sent', 'Partially Paid', 'Overdue'] }
    } as any) as any).select('invoiceNumber customer total amountPaid dueDate invoiceDate').lean();

    // 3. Scheduled AP Outflows (Unpaid Vendor Bills)
    const openBills: any[] = await (Bill.find({
      orgId,
      status: { $in: ['Open', 'Partially Paid', 'Overdue'] }
    } as any) as any).select('billNumber vendor totalAmount paidAmount dueDate billDate').lean();

    // 4. Pending Payroll Batches
    const pendingPayroll = await PayrollBatch.find({
      orgId,
      status: { $in: ['Draft', 'Approved'] }
    }).select('batchNumber month year totalNetPayable status').lean();

    // 5. Recurring Monthly Expenses
    const recurringExpenses = await RecurringExpense.find({
      orgId,
      status: 'Active'
    }).select('profileName amount frequency nextExpenseDate').lean();

    // Grouping Buckets
    const buckets: Record<string, { inflows: number; outflows: number }> = {
      'Overdue': { inflows: 0, outflows: 0 },
      '0-30 Days': { inflows: 0, outflows: 0 },
      '31-60 Days': { inflows: 0, outflows: 0 },
      '61-90 Days': { inflows: 0, outflows: 0 },
      '90+ Days': { inflows: 0, outflows: 0 }
    };

    const getBucketKey = (dueDate: Date | string | null | undefined): string => {
      if (!dueDate) return '0-30 Days';
      const d = new Date(dueDate);
      const diffTime = d.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'Overdue';
      if (diffDays <= 30) return '0-30 Days';
      if (diffDays <= 60) return '31-60 Days';
      if (diffDays <= 90) return '61-90 Days';
      return '90+ Days';
    };

    let totalExpectedInflows = 0;
    const dailyInflowMap: Record<string, number> = {};

    for (const inv of openInvoices) {
      const balanceDue = (inv.total || 0) - (inv.amountPaid || 0);
      if (balanceDue > 0) {
        totalExpectedInflows += balanceDue;
        const bucket = getBucketKey(inv.dueDate);
        buckets[bucket].inflows += balanceDue;

        // Daily map
        const dateKey = inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : today.toISOString().split('T')[0];
        dailyInflowMap[dateKey] = (dailyInflowMap[dateKey] || 0) + balanceDue;
      }
    }

    let totalExpectedOutflows = 0;
    const dailyOutflowMap: Record<string, number> = {};

    for (const bill of openBills) {
      const balanceDue = (bill.totalAmount || 0) - (bill.paidAmount || 0);
      if (balanceDue > 0) {
        totalExpectedOutflows += balanceDue;
        const bucket = getBucketKey(bill.dueDate);
        buckets[bucket].outflows += balanceDue;

        const dateKey = bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : today.toISOString().split('T')[0];
        dailyOutflowMap[dateKey] = (dailyOutflowMap[dateKey] || 0) + balanceDue;
      }
    }

    // Add payroll obligations
    for (const pb of pendingPayroll) {
      const amt = pb.totalNetPayable || 0;
      totalExpectedOutflows += amt;
      buckets['0-30 Days'].outflows += amt;
      const dateKey = today.toISOString().split('T')[0];
      dailyOutflowMap[dateKey] = (dailyOutflowMap[dateKey] || 0) + amt;
    }

    // Add recurring monthly expenses
    for (const re of recurringExpenses) {
      const amt = re.amount || 0;
      totalExpectedOutflows += amt;
      buckets['0-30 Days'].outflows += amt;
    }

    // Build Bucket Array
    const bucketArray: ICashBucket[] = Object.keys(buckets).map(key => ({
      period: key,
      inflows: Math.round(buckets[key].inflows),
      outflows: Math.round(buckets[key].outflows),
      net: Math.round(buckets[key].inflows - buckets[key].outflows)
    }));

    // Build Daily Cash Curve for horizon
    const dailyCurve: IDailyCashCurvePoint[] = [];
    let runningBalance = startingCash;
    let lowestCashPoint = startingCash;
    let lowestCashDate = today.toISOString().split('T')[0];

    for (let i = 0; i < horizonDays; i++) {
      const curDate = new Date(today);
      curDate.setDate(today.getDate() + i);
      const dateStr = curDate.toISOString().split('T')[0];

      const dayIn = dailyInflowMap[dateStr] || 0;
      const dayOut = dailyOutflowMap[dateStr] || 0;

      runningBalance = runningBalance + dayIn - dayOut;

      if (runningBalance < lowestCashPoint) {
        lowestCashPoint = runningBalance;
        lowestCashDate = dateStr;
      }

      // Record daily sample (or every 3 days if horizon is large)
      if (i % 2 === 0 || i === horizonDays - 1) {
        dailyCurve.push({
          date: dateStr,
          inflows: Math.round(dayIn),
          outflows: Math.round(dayOut),
          closingBalance: Math.round(runningBalance)
        });
      }
    }

    // Average burn rate and runway calculation
    const netCashFlow90 = totalExpectedInflows - totalExpectedOutflows;
    const projectedEndCash = startingCash + netCashFlow90;
    const dailyBurnRate = totalExpectedOutflows / horizonDays;
    const runwayDays = dailyBurnRate > 0 ? Math.round(startingCash / dailyBurnRate) : 999;

    return {
      asOfDate: today,
      horizonDays,
      liquidity: {
        startingCash: Math.round(startingCash),
        totalBankCash: Math.round(totalBankCash),
        totalCreditCardDebt: Math.round(totalCreditCardDebt)
      },
      projections: {
        totalExpectedInflows: Math.round(totalExpectedInflows),
        totalExpectedOutflows: Math.round(totalExpectedOutflows),
        netCashFlow: Math.round(netCashFlow90),
        projectedEndCash: Math.round(projectedEndCash),
        dailyBurnRate: Math.round(dailyBurnRate),
        runwayDays: runwayDays > 0 ? runwayDays : 0,
        lowestCashPoint: Math.round(lowestCashPoint),
        lowestCashDate,
        hasLiquidityRisk: lowestCashPoint < 0
      },
      buckets: bucketArray,
      dailyCurve
    };
  }
}

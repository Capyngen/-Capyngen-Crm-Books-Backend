import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getInventoryDashboardData, getDashboardData } from '../domains/books/controllers/dashboardController';

dotenv.config();

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to MongoDB Atlas...');

  const spinnyId = '6aa797278d301b4735f1d322';

  // Mock Request & Response for getInventoryDashboardData
  const mockReq = {
    org: { _id: spinnyId },
    headers: {}
  } as any;

  let inventoryDashboardOutput: any = null;
  const mockRes = {
    json: (payload: any) => {
      inventoryDashboardOutput = payload;
    },
    status: (code: number) => ({
      json: (payload: any) => {
        inventoryDashboardOutput = { statusCode: code, ...payload };
      }
    })
  } as any;

  console.log('\n--- Testing getInventoryDashboardData for Spinny ---');
  await getInventoryDashboardData(mockReq, mockRes);
  console.log('Inventory Dashboard Response:');
  console.log(JSON.stringify(inventoryDashboardOutput, null, 2));

  // Mock Request & Response for Books getDashboardData
  let booksDashboardOutput: any = null;
  const mockBooksRes = {
    json: (payload: any) => {
      booksDashboardOutput = payload;
    },
    status: (code: number) => ({
      json: (payload: any) => {
        booksDashboardOutput = { statusCode: code, ...payload };
      }
    })
  } as any;

  console.log('\n--- Testing Books getDashboardData for Spinny ---');
  await getDashboardData(mockReq, mockBooksRes);
  console.log('Books Dashboard Key Metrics:');
  if (booksDashboardOutput?.data) {
    const d = booksDashboardOutput.data;
    console.log({
      totalReceivables: d.totalReceivables,
      totalPayables: d.totalPayables,
      totalIncome: d.totalIncome,
      totalExpense: d.totalExpense,
      netProfit: d.netProfit,
      recentActivityCount: d.recentActivity?.length
    });
  }

  // Mock Request & Response for Billing getDashboardData
  const { getDashboardData: getBillingDashboardData } = await import('../domains/billing/controllers/dashboardController');
  let billingDashboardOutput: any = null;
  const mockBillingRes = {
    json: (payload: any) => {
      billingDashboardOutput = payload;
    },
    status: (code: number) => ({
      json: (payload: any) => {
        billingDashboardOutput = { statusCode: code, ...payload };
      }
    })
  } as any;

  console.log('\n--- Testing Billing getDashboardData for Spinny ---');
  await getBillingDashboardData(mockReq, mockBillingRes);
  console.log('Billing Dashboard Key Metrics:');
  if (billingDashboardOutput?.data) {
    const bd = billingDashboardOutput.data;
    console.log({
      netRevenue: bd.netRevenue,
      mrr: bd.mrr,
      activeCustomers: bd.activeCustomers,
      recentCustomersCount: bd.recentCustomers?.length,
      recentEventsCount: bd.recentEvents?.length
    });
  }

  await mongoose.disconnect();
}

verify().catch((e) => {
  console.error('Verification error:', e);
  process.exit(1);
});

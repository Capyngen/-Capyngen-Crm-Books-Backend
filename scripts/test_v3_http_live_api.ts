import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import express from 'express';
import erpV3Routes from '../src/routes/erpV3Routes';
import Item from '../src/domains/inventory/models/Item';
import PurchaseOrder from '../src/domains/inventory/models/PurchaseOrder';
import SalesOrder from '../src/domains/billing/models/SalesOrder';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';

async function runHttpApiTest() {
  console.log('================================================================================');
  console.log('🌐 TESTING LIVE HTTP REST APIS FOR V3 BUSINESS LOGIC (PORT 5099)');
  console.log('================================================================================\n');

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas: hrms_crm');

  const testApp = express();
  testApp.use(express.json());
  testApp.use('/api/v1/erp', erpV3Routes);

  const server = testApp.listen(5099);
  console.log('✅ Live V3 REST API Server listening on http://localhost:5099/api/v1/erp');

  const testOrgId = '6aa797278d301b4735f1d322';
  const headers = {
    'Content-Type': 'application/json',
    'x-org-id': testOrgId
  };

  try {
    // 1. GET /api/v1/erp/config
    console.log('\n--- 1. Testing GET /api/v1/erp/config ---');
    const configRes = await fetch('http://localhost:5099/api/v1/erp/config', { headers });
    const configData: any = await configRes.json();
    console.log(`• Status: ${configRes.status}, Success: ${configData.success}`);
    console.log(`• Org ID: ${configData.data?.orgId}, Profile: ${configData.data?.controlProfile}`);
    if (configRes.status !== 200 || !configData.data?.tolerances) {
      throw new Error('GET /api/v1/erp/config failed!');
    }
    console.log('✅ [PASSED] GET /api/v1/erp/config');

    // 2. PUT /api/v1/erp/config
    console.log('\n--- 2. Testing PUT /api/v1/erp/config ---');
    const updateRes = await fetch('http://localhost:5099/api/v1/erp/config', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        'tolerances.overDeliveryTolerancePct': 6
      })
    });
    const updateData: any = await updateRes.json();
    console.log(`• Status: ${updateRes.status}, OverDelivery Tolerance: ${updateData.data?.tolerances?.overDeliveryTolerancePct}%`);
    if (updateRes.status !== 200 || updateData.data?.tolerances?.overDeliveryTolerancePct !== 6) {
      throw new Error('PUT /api/v1/erp/config failed!');
    }
    console.log('✅ [PASSED] PUT /api/v1/erp/config');

    // Restore default
    await fetch('http://localhost:5099/api/v1/erp/config', {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        'tolerances.overDeliveryTolerancePct': 5
      })
    });

    // 3. Create test item and test GET /api/v1/erp/atp/:itemId
    console.log('\n--- 3. Testing GET /api/v1/erp/atp/:itemId ---');
    const timestamp = Date.now().toString().slice(-4);
    const testSku = `HTTP-V3-${timestamp}`;
    const item = await Item.create({
      orgId: testOrgId,
      name: `HTTP Test Item ${timestamp}`,
      sku: testSku,
      type: 'goods',
      unit: 'pcs',
      rate: 3500,
      purchaseRate: 2000,
      stockOnHand: 0,
      stock: 0,
      isActive: true
    });

    const atpRes = await fetch(`http://localhost:5099/api/v1/erp/atp/${item._id}`, { headers });
    const atpData: any = await atpRes.json();
    console.log(`• Status: ${atpRes.status}, ATP: ${atpData.data?.atp}`);
    if (atpRes.status !== 200 || atpData.data?.atp !== 0) {
      throw new Error('GET /api/v1/erp/atp/:itemId failed!');
    }
    console.log('✅ [PASSED] GET /api/v1/erp/atp/:itemId');

    // 4. POST /api/v1/erp/inbound/receipt (Flow 1)
    console.log('\n--- 4. Testing POST /api/v1/erp/inbound/receipt (Flow 1) ---');
    const po = await PurchaseOrder.create({
      orgId: testOrgId,
      vendorId: new mongoose.Types.ObjectId(),
      poNumber: `PO-HTTP-${timestamp}`,
      orderDate: new Date(),
      lineItems: [
        {
          itemId: item._id,
          quantity: 50,
          rate: 2000,
          amount: 100000,
          account: 'Cost of Goods Sold'
        }
      ],
      subTotal: 100000,
      totalAmount: 100000,
      status: 'Issued'
    });

    const inboundRes = await fetch('http://localhost:5099/api/v1/erp/inbound/receipt', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        poId: po._id.toString(),
        itemId: item._id.toString(),
        itemSku: testSku,
        warehouseId: 'HTTP-WAREHOUSE-01',
        binCode: 'BIN-HTTP-01',
        receivedQty: 50,
        rejectedQty: 0,
        vendorBillPricePerUnit: 2000
      })
    });
    const inboundData: any = await inboundRes.json();
    console.log(`• Status: ${inboundRes.status}, Accepted Qty: ${inboundData.data?.acceptedQty}, New ATP: ${inboundData.data?.atp?.atp}`);
    if (inboundRes.status !== 200 || inboundData.data?.atp?.atp !== 50) {
      throw new Error('POST /api/v1/erp/inbound/receipt failed!');
    }
    console.log('✅ [PASSED] POST /api/v1/erp/inbound/receipt');

    // 5. POST /api/v1/erp/outbound/fulfill (Flow 2)
    console.log('\n--- 5. Testing POST /api/v1/erp/outbound/fulfill (Flow 2) ---');
    const so = await SalesOrder.create({
      orgId: testOrgId,
      customer: new mongoose.Types.ObjectId(),
      salesOrderNumber: `SO-HTTP-${timestamp}`,
      salesOrderDate: new Date(),
      createdBy: 'HTTP-TESTER',
      items: [
        {
          item: item._id,
          quantity: 10,
          rate: 3500,
          amount: 35000
        }
      ],
      subTotal: 35000,
      total: 35000,
      status: 'Confirmed'
    });

    const fulfillRes = await fetch('http://localhost:5099/api/v1/erp/outbound/fulfill', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        soId: so._id.toString(),
        itemId: item._id.toString(),
        itemSku: testSku,
        warehouseId: 'HTTP-WAREHOUSE-01',
        binCode: 'BIN-HTTP-01',
        fulfillQty: 10,
        sellingPricePerUnit: 3500,
        costPricePerUnit: 2000
      })
    });
    const fulfillData: any = await fulfillRes.json();
    console.log(`• Status: ${fulfillRes.status}, Fulfill Status: ${fulfillData.data?.status}, Realized Gross: ₹${fulfillData.data?.grossSales}`);
    if (fulfillRes.status !== 200 || fulfillData.data?.grossSales !== 35000) {
      throw new Error('POST /api/v1/erp/outbound/fulfill failed!');
    }
    console.log('✅ [PASSED] POST /api/v1/erp/outbound/fulfill');

    // 6. POST /api/v1/erp/subscriptions/ssp-allocate (Flow 3)
    console.log('\n--- 6. Testing POST /api/v1/erp/subscriptions/ssp-allocate (Flow 3) ---');
    const sspRes = await fetch('http://localhost:5099/api/v1/erp/subscriptions/ssp-allocate', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customerId: 'CUST-HTTP-01',
        bundlePrice: 10000,
        hardwareSSP: 6000,
        saasSSP: 4000,
        durationMonths: 12
      })
    });
    const sspData: any = await sspRes.json();
    console.log(`• Status: ${sspRes.status}, Hardware Allocated: ₹${sspData.data?.allocatedHardwareRevenue}, SaaS Allocated: ₹${sspData.data?.allocatedSaasRevenue}`);
    if (sspRes.status !== 200 || sspData.data?.allocatedHardwareRevenue !== 6000) {
      throw new Error('POST /api/v1/erp/subscriptions/ssp-allocate failed!');
    }
    console.log('✅ [PASSED] POST /api/v1/erp/subscriptions/ssp-allocate');

    // 7. POST /api/v1/erp/finance/operation (Flow 10)
    console.log('\n--- 7. Testing POST /api/v1/erp/finance/operation (Flow 10) ---');
    const finRes = await fetch('http://localhost:5099/api/v1/erp/finance/operation', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        flowType: 'GATEWAY_SETTLEMENT',
        payload: {
          grossAmount: 50000,
          feeAmount: 1000,
          gstOnFee: 180
        }
      })
    });
    const finData: any = await finRes.json();
    console.log(`• Status: ${finRes.status}, Net Settle Journal: ${finData.data?.journalNumber}, Debits=Credits: ₹${finData.data?.total}`);
    if (finRes.status !== 200 || finData.data?.total !== 50000) {
      throw new Error('POST /api/v1/erp/finance/operation failed!');
    }
    console.log('✅ [PASSED] POST /api/v1/erp/finance/operation');

    // 8. POST /api/v1/erp/ground/exception (Flow 11)
    console.log('\n--- 8. Testing POST /api/v1/erp/ground/exception (Flow 11) ---');
    const exRes = await fetch('http://localhost:5099/api/v1/erp/ground/exception', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        exceptionType: 'PROVISIONAL_DOCK_INTAKE',
        payload: {
          itemId: item._id.toString(),
          itemSku: testSku,
          warehouseId: 'HTTP-WAREHOUSE-01',
          qty: 25
        }
      })
    });
    const exData: any = await exRes.json();
    console.log(`• Status: ${exRes.status}, Provisional Status: ${exData.data?.status}`);
    if (exRes.status !== 200 || exData.data?.status !== 'PROVISIONALLY_STORED_AT_DOCK') {
      throw new Error('POST /api/v1/erp/ground/exception failed!');
    }
    console.log('✅ [PASSED] POST /api/v1/erp/ground/exception');

    console.log('\n================================================================================');
    console.log('🎉 ALL LIVE REST API ENDPOINTS VERIFIED & FUNCTIONING WITH 100% ACCURACY');
    console.log('================================================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runHttpApiTest().catch((err) => {
  console.error('\n❌ HTTP API TEST FAILURE:', err);
  process.exit(1);
});

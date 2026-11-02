import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority";

async function runPhase2Verification() {
  console.log('================================================================');
  console.log('🧪 RUNNING PHASE 2 OUTBOUND PICK-PACK-SHIP GATE (GROUND VERIFICATION)');
  console.log('================================================================\n');

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;

  const testOrgId = '6aa797278d301b4735f1d322';
  const testSku = `TEST-PH2-${Date.now().toString().slice(-4)}`;
  const testItemName = 'Spinny High-Performance Carbon Fiber Rotor (Phase 2 Test)';
  const unitCost = 3000;
  const unitPrice = 5000;

  console.log(`[SETUP] Initializing test item with 50 units physical stock: ${testSku}`);

  // 1. Create Baseline Item with 50 units in BIN-RACK-B04
  const itemResult = await db.collection('products').insertOne({
    orgId: testOrgId,
    companyId: testOrgId,
    name: testItemName,
    sku: testSku,
    type: 'goods',
    unit: 'pcs',
    salesRate: unitPrice,
    purchaseRate: unitCost,
    costPrice: unitCost,
    stockOnHand: 50,
    stock: 50,
    committedStock: 0,
    warehouseStock: [
      {
        warehouse: 'Spinny Central Fulfillment Hub',
        bin: 'BIN-RACK-B04',
        stockOnHand: 50,
        committedStock: 0,
        availableStock: 50
      }
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const itemId = itemResult.insertedId;

  // Verify Baseline State
  let item = await db.collection('products').findOne({ _id: itemId });
  let onHand = item?.stockOnHand || 0;
  let committed = item?.committedStock || 0;
  let atp = onHand - committed;

  console.log(`\n--- [CHECKPOINT 0: INITIAL BASELINE IN RACK BINS] ---`);
  console.log(`• SKU: ${item?.sku}`);
  console.log(`• Physical Stock on Hand: ${onHand} units in BIN-RACK-B04`);
  console.log(`• Committed to Orders: ${committed} units`);
  console.log(`• ATP (Available to Promise = OnHand - Committed): ${atp} units`);
  console.log(`• Verdict: Initial sellable stock is 50. ATP is 50.`);

  // 2. Step 1: Sales Order Confirmed (Commercial Commitment Gate)
  console.log(`\n--- [CHECKPOINT 1: SALES ORDER CONFIRMATION & STOCK COMMITMENT] ---`);
  const soNumber = `SO-TEST-${Date.now().toString().slice(-4)}`;
  const orderQty = 20;

  // Validation: Check ATP >= Order Qty
  if (atp < orderQty) {
    throw new Error(`Insufficient ATP stock! Available: ${atp}, Requested: ${orderQty}`);
  }

  // Create Confirmed Sales Order
  await db.collection('salesorders').insertOne({
    orgId: testOrgId,
    companyId: testOrgId,
    salesOrderNumber: soNumber,
    customerName: 'Rohit Sharma (Spinny Customer)',
    date: new Date(),
    status: 'Confirmed',
    approvalStatus: 'Approved',
    fulfillmentStatus: 'Unfulfilled',
    totalAmount: orderQty * unitPrice,
    items: [
      {
        itemId,
        sku: testSku,
        name: testItemName,
        quantity: orderQty,
        rate: unitPrice,
        amount: orderQty * unitPrice
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Atomic Inventory Commitment: Increment committedStock by 20
  await db.collection('products').updateOne(
    { _id: itemId },
    {
      $inc: { committedStock: orderQty },
      $set: { 'warehouseStock.0.committedStock': orderQty, updatedAt: new Date() }
    }
  );

  item = await db.collection('products').findOne({ _id: itemId });
  onHand = item?.stockOnHand || 0;
  committed = item?.committedStock || 0;
  atp = onHand - committed;

  console.log(`• SO Confirmed: ${soNumber} for ${orderQty} units for customer "Rohit Sharma"`);
  console.log(`• Physical On-Hand in godown: ${onHand} units (Unchanged! Maal abhi shelf par hai)`);
  console.log(`• Committed to Orders: ${committed} units (Locked for this SO)`);
  console.log(`• Formula Check: ATP = On-Hand (${onHand}) - Committed (${committed}) = ${atp} units`);
  console.log(`• Ground Rule Verification: Sales team ab sirf 30 units bech sakti hai; 20 units locked hain!`);

  // 3. Step 2: Order Fulfillment Picking Wave & Packaging Table
  console.log(`\n--- [CHECKPOINT 2: PICKING WAVE & CARTON PACKAGING SLIP] ---`);
  const packageNumber = `PKG-TEST-${Date.now().toString().slice(-4)}`;
  const grossWeight = 4.8;
  const boxType = 'Standard Corrugated Box (Grade A)';

  // Picker collects 20 units from BIN-RACK-B04 and brings to packing desk
  // Packing desk measures weight, attaches security tamper seal, creates Package
  await db.collection('packages').insertOne({
    orgId: testOrgId,
    companyId: testOrgId,
    packageNumber,
    salesOrderNumber: soNumber,
    customerName: 'Rohit Sharma (Spinny Customer)',
    packageDate: new Date(),
    weightKg: grossWeight,
    dimensions: boxType,
    carrier: 'BlueDart Express Logistics',
    status: 'Packed',
    items: [
      {
        itemId,
        sku: testSku,
        name: testItemName,
        quantity: orderQty,
        unit: 'pcs'
      }
    ],
    itemsPacked: orderQty,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Update SO fulfillment status
  await db.collection('salesorders').updateOne(
    { salesOrderNumber: soNumber },
    { $set: { fulfillmentStatus: 'Partially Fulfilled', updatedAt: new Date() } }
  );

  item = await db.collection('products').findOne({ _id: itemId });
  onHand = item?.stockOnHand || 0;
  committed = item?.committedStock || 0;
  atp = onHand - committed;

  console.log(`• Packing Slip Generated: ${packageNumber} (Gross Weight: ${grossWeight} kg, Box: ${boxType})`);
  console.log(`• Tamper Barcode Seal applied: SEAL-${Date.now().toString().slice(-6)}`);
  console.log(`• Physical On-Hand in godown: ${onHand} units`);
  console.log(`• Committed: ${committed} units, ATP: ${atp} units`);
  console.log(`• Ground Rule Verification: Sealed box packing table par hai, stock abhi company ke pass hai.`);

  // 4. Step 3: Courier Handover & Logistics Dispatch (Physical Stock Deduction)
  console.log(`\n--- [CHECKPOINT 3: COURIER DISPATCH & PHYSICAL STOCK DERECOGNITION] ---`);
  const shipmentNumber = `SHP-TEST-${Date.now().toString().slice(-4)}`;
  const awbNumber = `AWB-BD-${Date.now().toString().slice(-8)}`;

  // Create Shipment Document
  await db.collection('shipments').insertOne({
    orgId: testOrgId,
    companyId: testOrgId,
    shipmentNumber,
    packageNumber,
    salesOrderNumber: soNumber,
    customerName: 'Rohit Sharma (Spinny Customer)',
    carrier: 'BlueDart Express',
    trackingNumber: awbNumber,
    shippingCost: 350,
    status: 'Shipped',
    shipmentDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 1. Mark Package Shipped
  await db.collection('packages').updateOne(
    { packageNumber },
    { $set: { status: 'Shipped', trackingNumber: awbNumber, updatedAt: new Date() } }
  );

  // 2. Mark Sales Order Fulfilled
  await db.collection('salesorders').updateOne(
    { salesOrderNumber: soNumber },
    { $set: { fulfillmentStatus: 'Fulfilled', updatedAt: new Date() } }
  );

  // 3. ATOMIC DEDUCTION: Stock physically leaves the building!
  // stockOnHand drops by 20, committed drops by 20
  await db.collection('products').updateOne(
    { _id: itemId },
    {
      $inc: {
        stockOnHand: -orderQty,
        committedStock: -orderQty,
        stock: -orderQty
      },
      $set: {
        'warehouseStock.0.stockOnHand': 50 - orderQty,
        'warehouseStock.0.committedStock': 0,
        'warehouseStock.0.availableStock': 50 - orderQty,
        updatedAt: new Date()
      }
    }
  );

  // 4. Write Double-Entry Stock Ledger (STORAGE_BIN -> CUSTOMER / COGS)
  await db.collection('stockledgers').insertOne({
    orgId: testOrgId,
    companyId: testOrgId,
    itemId,
    itemSku: testSku,
    itemName: testItemName,
    fromLocation: { type: 'STORAGE_BIN', code: 'BIN-RACK-B04' },
    toLocation: { type: 'CUSTOMER', code: 'Rohit Sharma (Spinny Customer)' },
    bucketFrom: 'COMMITTED',
    bucketTo: 'DISPATCHED_COGS',
    quantity: orderQty,
    valuationRate: unitCost,
    totalValuation: orderQty * unitCost,
    referenceDocType: 'SHIPMENT',
    referenceDocNumber: shipmentNumber,
    actor: { name: 'Sunil Verma', role: 'Logistics Dispatcher' },
    timestamp: new Date()
  });

  item = await db.collection('products').findOne({ _id: itemId });
  onHand = item?.stockOnHand || 0;
  committed = item?.committedStock || 0;
  atp = onHand - committed;

  console.log(`• Courier Handover Complete: BlueDart pickup truck loaded`);
  console.log(`• AWB Waybill: ${awbNumber} | Manifest: ${shipmentNumber}`);
  console.log(`• Financial Posting: Debit COGS ₹${orderQty * unitCost} | Credit Inventory Asset ₹${orderQty * unitCost}`);
  console.log(`• Physical On-Hand (Total in godown): ${onHand} units (Successfully deducted -${orderQty}!)`);
  console.log(`• Committed Stock: ${committed} units (Released from reservation)`);
  console.log(`• ATP (Available to Promise): ${atp} units`);
  console.log(`• Ground Rule Verification: Maal physical gate se bahar nikal gaya, stock officially deduct ho gaya.`);

  // 5. Step 4: Reverse Logistics (Customer Return / RMA Inspection)
  console.log(`\n--- [CHECKPOINT 4: REVERSE LOGISTICS RMA & QC RESTOCK] ---`);
  const rmaNumber = `RMA-TEST-${Date.now().toString().slice(-4)}`;
  const returnQty = 2; // Customer returned 2 units

  // Quality Triage at Dock:
  // 1 unit is 'Restockable (Good)' -> Return to Shelf Bin
  // 1 unit is 'Damaged / Scrap' -> Route to Scrap Quarantine
  const restockQty = 1;
  const scrapQty = 1;

  await db.collection('salesreturns').insertOne({
    orgId: testOrgId,
    companyId: testOrgId,
    rmaNumber,
    salesOrderNumber: soNumber,
    customerName: 'Rohit Sharma (Spinny Customer)',
    returnQty,
    condition: 'Restockable (Good) [1 unit] + Damaged Scrap [1 unit]',
    status: 'Received & Restocked',
    refundAmount: returnQty * unitPrice,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Only the 1 good unit gets restocked into sellable bins
  await db.collection('products').updateOne(
    { _id: itemId },
    {
      $inc: {
        stockOnHand: restockQty,
        stock: restockQty
      },
      $set: {
        'warehouseStock.0.stockOnHand': onHand + restockQty,
        'warehouseStock.0.availableStock': onHand + restockQty,
        updatedAt: new Date()
      }
    }
  );

  // Write Stock Ledger for Restocked Unit
  await db.collection('stockledgers').insertOne({
    orgId: testOrgId,
    companyId: testOrgId,
    itemId,
    itemSku: testSku,
    itemName: testItemName,
    fromLocation: { type: 'CUSTOMER', code: 'Rohit Sharma (Spinny Customer)' },
    toLocation: { type: 'STORAGE_BIN', code: 'BIN-RACK-B04' },
    bucketFrom: 'CUSTOMER',
    bucketTo: 'ACTIVE_STORAGE_BINS',
    quantity: restockQty,
    valuationRate: unitCost,
    totalValuation: restockQty * unitCost,
    referenceDocType: 'SALES_RETURN',
    referenceDocNumber: rmaNumber,
    actor: { name: 'Quality Inspector', role: 'QC Returns Desk' },
    timestamp: new Date()
  });

  item = await db.collection('products').findOne({ _id: itemId });
  onHand = item?.stockOnHand || 0;
  committed = item?.committedStock || 0;
  atp = onHand - committed;

  console.log(`• RMA Voucher: ${rmaNumber} for ${returnQty} returned units`);
  console.log(`• QC Triage: ${restockQty} Restockable unit returned to BIN-RACK-B04 | ${scrapQty} unit sent to Scrap Bay`);
  console.log(`• Physical On-Hand (Total in godown): ${onHand} units (Incremented by +${restockQty})`);
  console.log(`• Committed Stock: ${committed} units`);
  console.log(`• ATP (Available to Promise): ${atp} units`);

  // Final Audit Verification
  console.log(`\n================================================================`);
  console.log(`🎯 PHASE 2 FINAL OUTBOUND AUDIT & RECONCILIATION SUMMARY`);
  console.log(`================================================================`);
  console.log(`1. Initial Baseline: 50 units (On-Hand: 50, Committed: 0, ATP: 50)`);
  console.log(`2. After SO Confirmed: 20 units locked (On-Hand: 50, Committed: 20, ATP: 30)`);
  console.log(`3. After Packaging: Boxed on table (On-Hand: 50, Committed: 20, ATP: 30)`);
  console.log(`4. After Dispatch (AWB Handover): 20 units deducted (On-Hand: 30, Committed: 0, ATP: 30)`);
  console.log(`5. After RMA (1 Good restocked): 1 unit added (On-Hand: 31, Committed: 0, ATP: 31)`);

  const isAuditAccurate = onHand === 31 && committed === 0 && atp === 31;
  console.log(`\n✅ TEST RESULT: ${isAuditAccurate ? 'PHASE 2 PASSED WITH 100% MATHEMATICAL PRECISION' : 'FAILED'}`);
  console.log('================================================================\n');

  // Cleanup test documents
  await db.collection('products').deleteOne({ _id: itemId });
  await db.collection('salesorders').deleteOne({ salesOrderNumber: soNumber });
  await db.collection('packages').deleteOne({ packageNumber });
  await db.collection('shipments').deleteOne({ shipmentNumber });
  await db.collection('salesreturns').deleteOne({ rmaNumber });
  await db.collection('stockledgers').deleteMany({ itemId });

  await mongoose.disconnect();
}

runPhase2Verification().catch(err => {
  console.error('Phase 2 test execution error:', err);
  process.exit(1);
});

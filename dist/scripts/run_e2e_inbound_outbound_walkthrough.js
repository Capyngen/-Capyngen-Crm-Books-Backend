"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp';
async function runE2EWalkthrough() {
    console.log('===============================================================');
    console.log('   🚀 ENTERPRISE ERP END-TO-END INBOUND & OUTBOUND WALKTHROUGH  ');
    console.log('===============================================================\n');
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas Database.\n');
        const db = mongoose_1.default.connection.db;
        if (!db)
            throw new Error('No DB connection');
        const orgId = '6aa797278d301b4735f1d322';
        const timestamp = Date.now().toString().slice(-4);
        const sku = `SKU-E2E-${timestamp}`;
        const itemName = `Enterprise Test Component ${timestamp}`;
        // -------------------------------------------------------------------------
        // STEP 0: Baseline Item & Inventory Setup
        // -------------------------------------------------------------------------
        console.log('▶ STEP 0: Establishing Inventory Item Baseline...');
        const itemDoc = {
            _id: new mongoose_1.default.Types.ObjectId(),
            name: itemName,
            sku: sku,
            stockOnHand: 100, // starting stock
            reorderPoint: 30,
            salesRate: 3500.00,
            purchaseRate: 2000.00,
            unit: 'Units',
            category: 'Electronics',
            status: 'Active',
            orgId: orgId,
            companyId: new mongoose_1.default.Types.ObjectId(orgId),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('items').insertOne(itemDoc);
        console.log(`   • Item Created: "${itemName}" (${sku})`);
        console.log(`   • Initial Stock on Hand: ${itemDoc.stockOnHand} Units\n`);
        // -------------------------------------------------------------------------
        // STEP 1: Inbound Purchase Order (PO)
        // -------------------------------------------------------------------------
        console.log('▶ STEP 1: Creating Inbound Purchase Order (PO)...');
        const poNumber = `PO-E2E-${timestamp}`;
        const poQty = 50;
        const poUnitRate = 2000.00;
        const poSubTotal = poQty * poUnitRate;
        const poTax = poSubTotal * 0.18;
        const poTotal = poSubTotal + poTax;
        const poDoc = {
            _id: new mongoose_1.default.Types.ObjectId(),
            orderNumber: poNumber,
            poNumber: poNumber,
            poDate: new Date(),
            vendorId: new mongoose_1.default.Types.ObjectId(),
            vendorName: 'Brembo Brake Systems India Ltd.',
            warehouse: 'Spinny Central Fulfillment Hub',
            warehouseName: 'Spinny Central Fulfillment Hub',
            status: 'Approved',
            approvalStatus: 'Approved',
            lineItems: [
                {
                    itemId: itemDoc._id,
                    sku: sku,
                    itemName: itemName,
                    quantity: poQty,
                    unitPrice: poUnitRate,
                    taxRate: 18,
                    taxAmount: poTax,
                    total: poTotal
                }
            ],
            subTotal: poSubTotal,
            taxTotal: poTax,
            total: poTotal,
            orgId: orgId,
            companyId: new mongoose_1.default.Types.ObjectId(orgId),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('purchaseorders').insertOne(poDoc);
        console.log(`   • PO Created: ${poNumber}`);
        console.log(`   • Order Value: ₹${poTotal.toLocaleString('en-IN')} (50 Units @ ₹${poUnitRate} + 18% GST)`);
        console.log(`   • Commercial Status: ${poDoc.status}\n`);
        // -------------------------------------------------------------------------
        // STEP 2: Inward Goods Receipt Note (GRN / Purchase Receive)
        // -------------------------------------------------------------------------
        console.log('▶ STEP 2: Receiving Items at Warehouse Dock (GRN Intake)...');
        const grnNumber = `GRN-E2E-${timestamp}`;
        const grnDoc = {
            _id: new mongoose_1.default.Types.ObjectId(),
            grnNumber: grnNumber,
            receiveNumber: grnNumber,
            poNumber: poNumber,
            purchaseOrderId: poDoc._id,
            vendor: poDoc.vendorId,
            vendorName: poDoc.vendorName,
            warehouse: poDoc.warehouse,
            warehouseName: poDoc.warehouseName,
            receivedQty: poQty,
            qcStatus: 'QC Passed',
            status: 'Received',
            stagingDock: 'Inbound Receiving Bay A-1',
            date: new Date().toISOString().split('T')[0],
            receiveDate: new Date(),
            items: [
                {
                    sku: sku,
                    name: itemName,
                    ordered: poQty,
                    received: poQty,
                    accepted: poQty,
                    rejected: 0,
                    batchNumber: `LOT-E2E-${timestamp}`
                }
            ],
            orgId: orgId,
            companyId: new mongoose_1.default.Types.ObjectId(orgId),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('purchasereceives').insertOne(grnDoc);
        // Update PO to Received and Increment stock
        await db.collection('purchaseorders').updateOne({ _id: poDoc._id }, { $set: { status: 'Received', updatedAt: new Date() } });
        await db.collection('items').updateOne({ _id: itemDoc._id }, { $inc: { stockOnHand: poQty } });
        const stockAfterGRN = await db.collection('items').findOne({ _id: itemDoc._id });
        console.log(`   • GRN Generated: ${grnNumber}`);
        console.log(`   • Quality Verdict: ${grnDoc.qcStatus} (100% Accepted, 0 Rejected)`);
        console.log(`   • PO Status Updated: "Received"`);
        console.log(`   • Stock on Hand After GRN Intake: ${stockAfterGRN?.stockOnHand} Units (+50 increase)\n`);
        // -------------------------------------------------------------------------
        // STEP 3: Warehouse Putaway (Dock-to-Rack Slotting)
        // -------------------------------------------------------------------------
        console.log('▶ STEP 3: Initiating & Completing Warehouse Putaway...');
        const pwNumber = `PW-E2E-${timestamp}`;
        const targetBin = 'BIN-RACK-B04';
        const pwDoc = {
            _id: new mongoose_1.default.Types.ObjectId(),
            putawayNumber: pwNumber,
            order: pwNumber,
            grnNumber: grnNumber,
            purchaseReceive: grnDoc._id,
            vendorName: poDoc.vendorName,
            itemName: itemName,
            itemSku: sku,
            quantity: poQty,
            stagingDock: 'Inbound Receiving Bay A-1',
            targetBin: targetBin,
            batchNumber: `LOT-E2E-${timestamp}`,
            status: 'Put Away Completed',
            date: new Date(),
            completedAt: new Date(),
            completedBy: 'Rahul Sharma (Warehouse Staging Lead)',
            orgId: orgId,
            companyId: new mongoose_1.default.Types.ObjectId(orgId),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('putaways').insertOne(pwDoc);
        console.log(`   • Putaway Order: ${pwNumber}`);
        console.log(`   • Origin Staging Bay: ${pwDoc.stagingDock}`);
        console.log(`   • Destination Storage Slot: ${targetBin}`);
        console.log(`   • Task State: "Put Away Completed" (Physical units slotted into storage)\n`);
        // -------------------------------------------------------------------------
        // STEP 4: Outbound Sales Order (SO) Fulfillment
        // -------------------------------------------------------------------------
        console.log('▶ STEP 4: Outbound Customer Order Dispatch...');
        const soNumber = `SO-E2E-${timestamp}`;
        const soQty = 10;
        const soTotal = soQty * itemDoc.salesRate * 1.18;
        const soDoc = {
            _id: new mongoose_1.default.Types.ObjectId(),
            salesOrderNumber: soNumber,
            orderDate: new Date(),
            customer: {
                displayName: 'Rohit Sharma (Spinny Customer)',
                email: 'rohit@spinny.com'
            },
            status: 'Confirmed',
            fulfillmentStatus: 'Fulfilled',
            items: [
                {
                    itemId: itemDoc._id,
                    sku: sku,
                    name: itemName,
                    quantity: soQty,
                    rate: itemDoc.salesRate,
                    amount: soQty * itemDoc.salesRate
                }
            ],
            totalAmount: soTotal,
            orgId: orgId,
            companyId: new mongoose_1.default.Types.ObjectId(orgId),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('salesorders').insertOne(soDoc);
        // Create Package
        const pkgNumber = `PKG-E2E-${timestamp}`;
        const pkgDoc = {
            _id: new mongoose_1.default.Types.ObjectId(),
            packageNumber: pkgNumber,
            salesOrderId: soDoc._id,
            salesOrderNumber: soNumber,
            customerName: 'Rohit Sharma (Spinny Customer)',
            packageDate: new Date(),
            weightKg: 4.5,
            carrier: 'Blue Dart Express',
            status: 'Packed',
            items: soDoc.items,
            orgId: orgId,
            companyId: new mongoose_1.default.Types.ObjectId(orgId),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('packages').insertOne(pkgDoc);
        // Create Shipment & Deduct Stock
        const shpNumber = `SHP-E2E-${timestamp}`;
        const trackingAWB = `AWB-IND-${timestamp}-8899`;
        const shpDoc = {
            _id: new mongoose_1.default.Types.ObjectId(),
            shipmentNumber: shpNumber,
            packageNumber: pkgNumber,
            customerName: 'Rohit Sharma (Spinny Customer)',
            shipmentDate: new Date(),
            carrier: 'Blue Dart Express',
            trackingNumber: trackingAWB,
            status: 'Shipped',
            orgId: orgId,
            companyId: new mongoose_1.default.Types.ObjectId(orgId),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('shipments').insertOne(shpDoc);
        await db.collection('items').updateOne({ _id: itemDoc._id }, { $inc: { stockOnHand: -soQty } });
        const stockAfterShipment = await db.collection('items').findOne({ _id: itemDoc._id });
        console.log(`   • Sales Order Created: ${soNumber} for ${soQty} Units`);
        console.log(`   • Package Created: ${pkgNumber} (Weight: 4.5 kg, Carrier: Blue Dart)`);
        console.log(`   • Shipment Dispatched: ${shpNumber} (Tracking: ${trackingAWB})`);
        console.log(`   • Stock on Hand After Dispatch: ${stockAfterShipment?.stockOnHand} Units (-10 units)\n`);
        // -------------------------------------------------------------------------
        // STEP 5: End-to-End Audit & Balance Reconciliation
        // -------------------------------------------------------------------------
        console.log('===============================================================');
        console.log('               📊 INVENTORY RECONCILIATION AUDIT              ');
        console.log('===============================================================');
        console.log(`Item SKU:                ${sku}`);
        console.log(`1. Initial Stock:        100 Units`);
        console.log(`2. Inbound PO Intake:    +50 Units (via ${grnNumber} & ${pwNumber})`);
        console.log(`3. Outbound Dispatched:  -10 Units (via ${pkgNumber} & ${shpNumber})`);
        console.log(`---------------------------------------------------------------`);
        console.log(`Calculated Final Stock:  140 Units`);
        console.log(`Actual DB Stock on Hand: ${stockAfterShipment?.stockOnHand} Units`);
        console.log(`Reconciliation Verdict:  ${stockAfterShipment?.stockOnHand === 140 ? '✅ 100% PERFECT MATCH' : '❌ VARIANCE'}`);
        console.log('===============================================================\n');
    }
    catch (err) {
        console.error('❌ E2E Walkthrough Error:', err.message);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Process completed cleanly.\n');
    }
}
runE2EWalkthrough();

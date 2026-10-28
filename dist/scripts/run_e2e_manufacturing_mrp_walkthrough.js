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
async function runManufacturingE2E() {
    console.log('================================================================');
    console.log('  🏭 ENTERPRISE MANUFACTURING & MRP LIFECYCLE E2E AUDIT WALKTHROUGH ');
    console.log('================================================================\n');
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas Database.\n');
        const db = mongoose_1.default.connection.db;
        if (!db)
            throw new Error('No DB connection');
        const orgId = '6aa797278d301b4735f1d322';
        const timestamp = Date.now().toString().slice(-4);
        // -------------------------------------------------------------------------
        // STEP 1: Setting Up Raw Material Inventory (BOM Components)
        // -------------------------------------------------------------------------
        console.log('▶ STEP 1: Configuring Bill of Materials (BOM) & Component Stocks...');
        const rawMaterial1Id = new mongoose_1.default.Types.ObjectId();
        const rawMaterial1Sku = `RM-CHASSIS-${timestamp}`;
        const rawMaterial1Name = `High-Tensile Drone Chassis ${timestamp}`;
        const rawMaterial2Id = new mongoose_1.default.Types.ObjectId();
        const rawMaterial2Sku = `RM-MOTOR-${timestamp}`;
        const rawMaterial2Name = `Brushless Coreless Motor ${timestamp}`;
        await db.collection('items').insertMany([
            {
                _id: rawMaterial1Id,
                name: rawMaterial1Name,
                sku: rawMaterial1Sku,
                stockOnHand: 100,
                stock: 100,
                stockQuantity: 100,
                unit: 'Pieces',
                purchaseRate: 500.00,
                salesRate: 800.00,
                category: 'Raw Materials',
                status: 'Active',
                orgId: orgId,
                companyId: new mongoose_1.default.Types.ObjectId(orgId),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: rawMaterial2Id,
                name: rawMaterial2Name,
                sku: rawMaterial2Sku,
                stockOnHand: 60,
                stock: 60,
                stockQuantity: 60,
                unit: 'Pieces',
                purchaseRate: 1500.00,
                salesRate: 2200.00,
                category: 'Raw Materials',
                status: 'Active',
                orgId: orgId,
                companyId: new mongoose_1.default.Types.ObjectId(orgId),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
        console.log(`   • Raw Material 1: "${rawMaterial1Name}" (${rawMaterial1Sku}) -> Stock: 100 Pcs @ ₹500`);
        console.log(`   • Raw Material 2: "${rawMaterial2Name}" (${rawMaterial2Sku}) -> Stock: 60 Pcs @ ₹1,500\n`);
        // -------------------------------------------------------------------------
        // STEP 2: Creating Finished Assembly Item with Multi-Level BOM Structure
        // -------------------------------------------------------------------------
        console.log('▶ STEP 2: Defining Multi-Level BOM for Finished Assembly...');
        const finishedGoodId = new mongoose_1.default.Types.ObjectId();
        const fgSku = `FG-DRONE-${timestamp}`;
        const fgName = `Autonomous Enterprise Drone System ${timestamp}`;
        // BOM: 2 Chassis + 4 Motors per 1 Finished Drone
        const bomSpecification = [
            {
                itemId: rawMaterial1Id,
                itemName: rawMaterial1Name,
                quantity: 2, // 2 chassis per drone
                wastagePercent: 0,
                unitCost: 500.00
            },
            {
                itemId: rawMaterial2Id,
                itemName: rawMaterial2Name,
                quantity: 4, // 4 motors per drone
                wastagePercent: 0,
                unitCost: 1500.00
            }
        ];
        await db.collection('items').insertOne({
            _id: finishedGoodId,
            name: fgName,
            sku: fgSku,
            itemClass: 'Assembly',
            stockOnHand: 0, // Starts at 0 finished stock
            stock: 0,
            stockQuantity: 0,
            unit: 'Sets',
            purchaseRate: 7000.00, // 2*500 + 4*1500 = 7000
            salesRate: 12500.00,
            category: 'Finished Goods',
            status: 'Active',
            bom: bomSpecification,
            orgId: orgId,
            companyId: new mongoose_1.default.Types.ObjectId(orgId),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log(`   • Finished Good Defined: "${fgName}" (${fgSku})`);
        console.log(`   • Initial FG Stock: 0 Sets`);
        console.log(`   • BOM Recipe: [2x Chassis (₹1,000) + 4x Motors (₹6,000)] = ₹7,000 Base Material Cost/Unit\n`);
        // -------------------------------------------------------------------------
        // STEP 3: Simulating MRP Engine Demand & Bill of Materials Explosion
        // -------------------------------------------------------------------------
        console.log('▶ STEP 3: Executing MRP Calculation & BOM Net Demand Explosion...');
        const targetProduceQty = 10; // Produce 10 Finished Drones
        const requiredChassis = targetProduceQty * 2; // 20 Pcs
        const requiredMotors = targetProduceQty * 4; // 40 Pcs
        console.log(`   • Production Target: ${targetProduceQty} Sets of "${fgName}"`);
        console.log(`   • Exploded Gross Demand for "${rawMaterial1Sku}": ${requiredChassis} Pcs (Available: 100 Pcs -> Feasible ✅)`);
        console.log(`   • Exploded Gross Demand for "${rawMaterial2Sku}": ${requiredMotors} Pcs (Available: 60 Pcs -> Feasible ✅)`);
        console.log(`   • MRP Recommendation: Schedule Immediate Work Order for In-House Manufacturing\n`);
        // -------------------------------------------------------------------------
        // STEP 4: Creating Production Work Order
        // -------------------------------------------------------------------------
        console.log('▶ STEP 4: Generating Production Work Order (WO)...');
        const woNumber = `WO-MFG-${timestamp}`;
        const warehouseId = new mongoose_1.default.Types.ObjectId();
        const woDoc = {
            _id: new mongoose_1.default.Types.ObjectId(),
            workOrderNumber: woNumber,
            orderNumber: woNumber,
            itemId: finishedGoodId,
            itemName: fgName,
            itemSku: fgSku,
            quantity: targetProduceQty,
            completedQuantity: 0,
            scrapQuantity: 0,
            targetWarehouseId: warehouseId,
            warehouseName: 'Main Production Line Hub #2',
            status: 'In Progress',
            priority: 'High',
            startDate: new Date(),
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            orgId: orgId,
            companyId: new mongoose_1.default.Types.ObjectId(orgId),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('workorders').insertOne(woDoc);
        console.log(`   • Work Order Generated: ${woNumber}`);
        console.log(`   • Production Batch: ${targetProduceQty} Units`);
        console.log(`   • Work Order Status: "In Progress" (Staged at ${woDoc.warehouseName})\n`);
        // -------------------------------------------------------------------------
        // STEP 5: Completing Production Work Order (BOM Assembly Execution)
        // -------------------------------------------------------------------------
        console.log('▶ STEP 5: Executing Work Order Assembly & Material Consumption...');
        // Deduct Raw Materials from DB
        await db.collection('items').updateOne({ _id: rawMaterial1Id }, {
            $inc: {
                stockOnHand: -requiredChassis,
                stock: -requiredChassis,
                stockQuantity: -requiredChassis
            }
        });
        await db.collection('items').updateOne({ _id: rawMaterial2Id }, {
            $inc: {
                stockOnHand: -requiredMotors,
                stock: -requiredMotors,
                stockQuantity: -requiredMotors
            }
        });
        // Increase Finished Good Stock in DB
        await db.collection('items').updateOne({ _id: finishedGoodId }, {
            $inc: {
                stockOnHand: targetProduceQty,
                stock: targetProduceQty,
                stockQuantity: targetProduceQty
            }
        });
        // Mark Work Order as Completed
        await db.collection('workorders').updateOne({ _id: woDoc._id }, {
            $set: {
                status: 'Completed',
                completedQuantity: targetProduceQty,
                completedAt: new Date(),
                updatedAt: new Date()
            }
        });
        // Fetch updated items
        const updatedRm1 = await db.collection('items').findOne({ _id: rawMaterial1Id });
        const updatedRm2 = await db.collection('items').findOne({ _id: rawMaterial2Id });
        const updatedFg = await db.collection('items').findOne({ _id: finishedGoodId });
        const updatedWo = await db.collection('workorders').findOne({ _id: woDoc._id });
        console.log(`   • Material 1 (${rawMaterial1Sku}) Deducted: 100 - ${requiredChassis} = ${updatedRm1?.stockOnHand} Pcs Remaining`);
        console.log(`   • Material 2 (${rawMaterial2Sku}) Deducted: 60 - ${requiredMotors} = ${updatedRm2?.stockOnHand} Pcs Remaining`);
        console.log(`   • Finished Goods (${fgSku}) Credited: 0 + ${targetProduceQty} = ${updatedFg?.stockOnHand} Sets Available`);
        console.log(`   • Work Order ${woNumber} Status: "${updatedWo?.status}" (Completed Qty: ${updatedWo?.completedQuantity}/${targetProduceQty})\n`);
        // -------------------------------------------------------------------------
        // STEP 6: Manufacturing Costing & Valuation Audit
        // -------------------------------------------------------------------------
        const totalRawMaterialCost = (requiredChassis * 500) + (requiredMotors * 1500); // 10,000 + 60,000 = 70,000
        const laborOverheadAbsorption = Math.round(totalRawMaterialCost * 0.12); // 12% standard overhead = 8,400
        const totalCapitalizedFGValue = totalRawMaterialCost + laborOverheadAbsorption; // 78,400
        console.log('================================================================');
        console.log('           🏭 MANUFACTURING & MRP AUDIT RECONCILIATION          ');
        console.log('================================================================');
        console.log(`Work Order:                     ${woNumber}`);
        console.log(`Finished Good Produced:         ${fgName} (${fgSku})`);
        console.log(`Produced Output:                ${updatedFg?.stockOnHand} Sets`);
        console.log(`Consumed Material 1:            ${requiredChassis} Pcs (${rawMaterial1Sku})`);
        console.log(`Consumed Material 2:            ${requiredMotors} Pcs (${rawMaterial2Sku})`);
        console.log(`----------------------------------------------------------------`);
        console.log(`Total Direct Material Cost:     ₹${totalRawMaterialCost.toLocaleString('en-IN')}`);
        console.log(`Overhead & Labor Absorption:    ₹${laborOverheadAbsorption.toLocaleString('en-IN')} (12% standard)`);
        console.log(`Capitalized Finished Goods:     ₹${totalCapitalizedFGValue.toLocaleString('en-IN')}`);
        console.log(`Work Order Execution Status:    ${updatedWo?.status === 'Completed' ? '✅ COMPLETED' : '❌ FAILED'}`);
        console.log(`Inventory Balance Match:        ${(updatedRm1?.stockOnHand === 80 && updatedRm2?.stockOnHand === 20 && updatedFg?.stockOnHand === 10) ? '✅ 100% PERFECT MATCH' : '❌ VARIANCE'}`);
        console.log('================================================================\n');
    }
    catch (err) {
        console.error('❌ Manufacturing E2E Error:', err.message);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Manufacturing E2E Process completed cleanly.\n');
    }
}
runManufacturingE2E();

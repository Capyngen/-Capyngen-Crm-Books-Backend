"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Item_1 = __importDefault(require("../domains/inventory/models/Item"));
const Customer_1 = __importDefault(require("../domains/billing/models/Customer"));
const Invoice_1 = __importDefault(require("../domains/billing/models/Invoice"));
const SalesOrder_1 = __importDefault(require("../domains/billing/models/SalesOrder"));
const Plan_1 = __importDefault(require("../domains/billing/models/Plan"));
const Warehouse_1 = __importDefault(require("../domains/inventory/models/Warehouse"));
const Shipment_1 = __importDefault(require("../domains/inventory/models/Shipment"));
const Package_1 = __importDefault(require("../domains/inventory/models/Package"));
const PurchaseOrder_1 = __importDefault(require("../domains/inventory/models/PurchaseOrder"));
const Bill_1 = __importDefault(require("../domains/inventory/models/Bill"));
const PaymentReceived_1 = __importDefault(require("../domains/billing/models/PaymentReceived"));
const PaymentMade_1 = __importDefault(require("../domains/books/models/PaymentMade"));
const Expense_1 = __importDefault(require("../domains/books/models/Expense"));
const tenantFilter_1 = require("../core/utils/tenantFilter");
async function run() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB Atlas for Step 1 Multi-Tenancy Verification\n');
    const mockReq = {
        org: { _id: '6aa797278d301b4735f1d322' },
        user: { companyId: '6aa797278d301b4735f1d322', role: 'Admin' },
        headers: { 'x-org-id': '6aa797278d301b4735f1d322' }
    };
    const filter = (0, tenantFilter_1.buildTenantFilter)(mockReq);
    console.log('Generated Tenant Filter:', JSON.stringify(filter, null, 2));
    const items = await Item_1.default.find(filter);
    console.log(`\n📦 Items (Products): ${items.length} items found (Expected: 12)`);
    items.forEach(i => console.log(`   - ${i.name} (SKU: ${i.sku}, Stock: ${i.stock})`));
    const customers = await Customer_1.default.find(filter);
    console.log(`\n👥 Customers: ${customers.length} found`);
    const invoices = await Invoice_1.default.find(filter);
    console.log(`\n📄 Invoices: ${invoices.length} found`);
    const salesOrders = await SalesOrder_1.default.find(filter);
    console.log(`\n🛒 Sales Orders: ${salesOrders.length} found`);
    const plans = await Plan_1.default.find(filter);
    console.log(`\n📋 Plans: ${plans.length} found`);
    const warehouses = await Warehouse_1.default.find(filter);
    console.log(`\n🏭 Warehouses: ${warehouses.length} found`);
    const shipments = await Shipment_1.default.find(filter);
    console.log(`\n🚚 Shipments: ${shipments.length} found`);
    const packages = await Package_1.default.find(filter);
    console.log(`\n📦 Packages: ${packages.length} found`);
    const purchaseOrders = await PurchaseOrder_1.default.find(filter);
    console.log(`\n📑 Purchase Orders: ${purchaseOrders.length} found`);
    const bills = await Bill_1.default.find(filter);
    console.log(`\n🧾 Bills: ${bills.length} found`);
    const paymentsReceived = await PaymentReceived_1.default.find(filter);
    console.log(`\n💵 Payments Received: ${paymentsReceived.length} found`);
    const paymentsMade = await PaymentMade_1.default.find(filter);
    console.log(`\n💸 Payments Made: ${paymentsMade.length} found`);
    const expenses = await Expense_1.default.find(filter);
    console.log(`\n💳 Expenses: ${expenses.length} found`);
    console.log('\n=============================================');
    if (items.length === 12) {
        console.log('🎯 SUCCESS: All 12 Spinny items are matched cleanly!');
    }
    else {
        console.log(`⚠️ WARNING: Expected 12 items, but got ${items.length}`);
    }
    console.log('=============================================\n');
    await mongoose_1.default.disconnect();
}
run().catch((err) => {
    console.error('Error during verification:', err);
    process.exit(1);
});

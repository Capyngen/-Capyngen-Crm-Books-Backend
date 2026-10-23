"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ERP_COLLECTIONS = [
    // Items & Inventory
    'products', 'items', 'booksitems', 'inventoryadjustments', 'warehouses', 'transferorders',
    'shipments', 'packages', 'moveorders', 'putaways', 'workorders', 'machines', 'routings',
    // Sales
    'clientaccounts', 'customers', 'bookscustomers', 'quotes', 'salesorders', 'invoices',
    'recurringinvoices', 'deliverychallans', 'paymentsreceived', 'creditnotes',
    // Purchases
    'vendors', 'booksvendors', 'expenses', 'recurringexpenses', 'mileageexpenses',
    'purchaseorders', 'bills', 'recurringbills', 'paymentsmade', 'vendorcredits',
    // Accountant & Banking
    'chartofaccounts', 'journals', 'recurringjournals', 'bankaccounts', 'bankingrules',
    'budgets', 'fixedassets', 'intercompanytransactions', 'currencyadjustments', 'transactionlocks',
    // Projects & HRMS
    'projects', 'timeentries', 'employees', 'payrollbatches', 'attendances', 'leaves', 'employeeexpenseclaims',
    // Billing
    'plans', 'subscriptions', 'addons', 'coupons', 'pricingwidgets', 'documents'
];
async function run() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || '');
    const spinnyId = new mongoose_1.default.Types.ObjectId('6aa797278d301b4735f1d322');
    const spinnyStr = '6aa797278d301b4735f1d322';
    console.log('=== TARGETED ERP AUDIT FOR SPINNY (6aa797278d301b4735f1d322) ===\n');
    for (const collName of ERP_COLLECTIONS) {
        try {
            const coll = mongoose_1.default.connection.collection(collName);
            const count = await coll.countDocuments({
                $or: [
                    { companyId: spinnyId },
                    { companyId: spinnyStr },
                    { orgId: spinnyId },
                    { orgId: spinnyStr }
                ]
            });
            const totalInColl = await coll.countDocuments({});
            if (count > 0) {
                console.log(`✅ [${collName.toUpperCase()}]: ${count} records for Spinny (total in db: ${totalInColl})`);
            }
            else {
                console.log(`❌ [${collName.toUpperCase()}]: 0 records for Spinny (total in db: ${totalInColl})`);
            }
        }
        catch (e) {
            console.log(`⚠️ [${collName.toUpperCase()}]: Collection check skipped (${e.message})`);
        }
    }
    await mongoose_1.default.disconnect();
}
run().catch(console.error);

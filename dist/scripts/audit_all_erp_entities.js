"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function run() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || '');
    const db = mongoose_1.default.connection.db;
    if (!db)
        process.exit(1);
    const spinnyStr = '6aa797278d301b4735f1d322';
    const spinnyObj = new mongoose_1.default.Types.ObjectId(spinnyStr);
    const collections = [
        'products', 'items', 'booksitems',
        'clientaccounts', 'customers', 'bookscustomers',
        'vendors', 'booksvendors',
        'salesorders', 'bookssalesorders',
        'invoices', 'booksinvoices',
        'quotes', 'booksquotes',
        'packages',
        'shipments',
        'bills', 'booksbills',
        'purchaseorders', 'bookspurchaseorders',
        'expenses', 'booksexpenses',
        'paymentsreceived', 'bookspaymentsreceived',
        'paymentsmade', 'bookspaymentsmade',
        'warehouses', 'bookswarehouses',
        'plans', 'addons', 'coupons', 'subscriptions'
    ];
    console.log('--- MongoDB Entity Audit for Spinny (Tenant: ' + spinnyStr + ') ---');
    const results = {};
    for (const colName of collections) {
        try {
            const col = db.collection(colName);
            const total = await col.countDocuments();
            const matchStr = await col.countDocuments({
                $or: [{ companyId: spinnyStr }, { orgId: spinnyStr }]
            });
            const matchObj = await col.countDocuments({
                $or: [{ companyId: spinnyObj }, { orgId: spinnyObj }]
            });
            const matchCombined = await col.countDocuments({
                $or: [
                    { companyId: spinnyStr },
                    { companyId: spinnyObj },
                    { orgId: spinnyStr },
                    { orgId: spinnyObj }
                ]
            });
            results[colName] = {
                totalInDb: total,
                matchString: matchStr,
                matchObjectId: matchObj,
                matchCombined: matchCombined
            };
        }
        catch (e) {
            results[colName] = { error: e.message };
        }
    }
    console.table(results);
    process.exit(0);
}
run();

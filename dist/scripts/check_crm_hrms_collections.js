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
    const crmHrmsCols = [
        'leads', 'deals', 'contacts', 'accounts',
        'employees', 'payrollbatches', 'payslips', 'leaves', 'attendances',
        'employeeexpenseclaims', 'expenseclaims',
        'journals', 'generalledgers', 'chartofaccounts', 'bankaccounts'
    ];
    console.log('--- CRM, HRMS, and Accountant Collections for Spinny ---');
    const results = {};
    for (const c of crmHrmsCols) {
        try {
            const col = db.collection(c);
            const total = await col.countDocuments();
            const matchStr = await col.countDocuments({
                $or: [{ companyId: spinnyStr }, { orgId: spinnyStr }]
            });
            const matchObj = await col.countDocuments({
                $or: [{ companyId: spinnyObj }, { orgId: spinnyObj }]
            });
            results[c] = { totalInDb: total, matchString: matchStr, matchObjectId: matchObj };
        }
        catch (e) {
            results[c] = { error: e.message };
        }
    }
    console.table(results);
    process.exit(0);
}
run();

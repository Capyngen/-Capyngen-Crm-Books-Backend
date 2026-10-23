"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URI = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';
async function checkCustomers() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('--- clientaccounts ---');
    const ca = await mongoose_1.default.connection.collection('clientaccounts').find({}).toArray();
    console.log('Total clientaccounts:', ca.length);
    for (const c of ca) {
        console.log('  _id:', c._id, 'name/displayName:', c.name || c.displayName, 'companyId:', c.companyId, 'orgId:', c.orgId);
    }
    console.log('\n--- customers ---');
    const cust = await mongoose_1.default.connection.collection('customers').find({}).toArray();
    console.log('Total customers:', cust.length);
    for (const c of cust) {
        console.log('  _id:', c._id, 'name/displayName:', c.name || c.displayName, 'companyId:', c.companyId, 'orgId:', c.orgId);
    }
    console.log('\n--- bookscustomers ---');
    const bc = await mongoose_1.default.connection.collection('bookscustomers').find({}).toArray();
    console.log('Total bookscustomers:', bc.length);
    for (const c of bc) {
        console.log('  _id:', c._id, 'name/displayName:', c.name || c.displayName, 'companyId:', c.companyId, 'orgId:', c.orgId);
    }
    await mongoose_1.default.disconnect();
    process.exit(0);
}
checkCustomers().catch(console.error);

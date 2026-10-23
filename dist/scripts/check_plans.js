"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URI = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';
async function check() {
    await mongoose_1.default.connect(MONGO_URI);
    const plan = await mongoose_1.default.connection.collection('plans').findOne({ _id: new mongoose_1.default.Types.ObjectId('6a9aab2b37f115525a01b0dc') });
    const reportKeys = (plan?.featureKeys || []).filter((k) => k.includes('report'));
    console.log('Report keys in Enterprise Plan (total ' + reportKeys.length + '):', reportKeys);
    await mongoose_1.default.disconnect();
    process.exit(0);
}
check().catch(console.error);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URI = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';
async function check() {
    await mongoose_1.default.connect(MONGO_URI);
    const plans = await mongoose_1.default.connection.collection('plans').find({}).toArray();
    console.log(`Total plans: ${plans.length}`);
    for (const p of plans) {
        console.log(`- Plan: ${p.name} | Type: ${p.planType} | ID: ${p._id} | Features: ${(p.featureKeys || []).length} | Modules: ${(p.modules || []).length}`);
    }
    await mongoose_1.default.disconnect();
    process.exit(0);
}
check().catch(console.error);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URI = 'mongodb+srv://vivekojha1750_db_user:UIXopqGqTI1o8zxX@cluster0.sywa3j.mongodb.net/hrms_crm?retryWrites=true&w=majority';
async function testMe() {
    await mongoose_1.default.connect(MONGO_URI);
    const orgId = '6aa797278d301b4735f1d322';
    const orgIdObj = new mongoose_1.default.Types.ObjectId(orgId);
    const company = await mongoose_1.default.connection.collection('companyprofiles').findOne({ _id: orgIdObj });
    let subscription = null;
    if (company && company.subscriptionId) {
        let subIdObj = null;
        try {
            subIdObj = new mongoose_1.default.Types.ObjectId(company.subscriptionId);
        }
        catch (e) { }
        if (subIdObj)
            subscription = await mongoose_1.default.connection.collection('subscriptions').findOne({ _id: subIdObj });
    }
    let plan = null;
    if (subscription?.planId) {
        let planIdObj = null;
        try {
            planIdObj = new mongoose_1.default.Types.ObjectId(subscription.planId);
        }
        catch (e) { }
        plan = (planIdObj ? await mongoose_1.default.connection.collection('plans').findOne({ _id: planIdObj }) : null) ||
            await mongoose_1.default.connection.collection('plans').findOne({ _id: subscription.planId });
    }
    console.log('Result for /api/v1/books/me:');
    console.log('Plan name:', plan?.name);
    console.log('featureKeys count:', plan?.featureKeys?.length);
    await mongoose_1.default.disconnect();
    process.exit(0);
}
testMe().catch(console.error);

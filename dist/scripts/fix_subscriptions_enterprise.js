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
    console.log('Connected to MongoDB');
    const enterprisePlanId = new mongoose_1.default.Types.ObjectId('6a9aab2b37f115525a01b0dc');
    // 1. Fix Spinny
    const spinnyComp = await mongoose_1.default.connection.collection('companyprofiles').findOne({ companyName: /spinny/i });
    if (spinnyComp) {
        const spinnyId = spinnyComp._id;
        let sub = await mongoose_1.default.connection.collection('subscriptions').findOne({
            $or: [{ companyId: spinnyId }, { companyId: spinnyId.toString() }, { orgId: spinnyId }, { orgId: spinnyId.toString() }]
        });
        const subId = sub ? sub._id : (spinnyComp.subscriptionId || new mongoose_1.default.Types.ObjectId());
        await mongoose_1.default.connection.collection('subscriptions').updateOne({ _id: subId }, {
            $set: {
                _id: subId,
                companyId: spinnyId,
                orgId: spinnyId,
                planId: enterprisePlanId,
                status: 'Active',
                billingCycle: 'Annual',
                updatedAt: new Date()
            },
            $setOnInsert: {
                createdAt: new Date()
            }
        }, { upsert: true });
        await mongoose_1.default.connection.collection('companyprofiles').updateOne({ _id: spinnyId }, { $set: { subscriptionId: subId, accountStatus: 'Active', platformType: 'Enterprise' } });
        console.log('✅ Spinny subscription linked to Master Enterprise Plan (424 features)! SubId:', subId);
    }
    // 2. Fix Honda
    const hondaComp = await mongoose_1.default.connection.collection('companyprofiles').findOne({ companyName: /honda/i });
    if (hondaComp) {
        const hondaId = hondaComp._id;
        let sub = await mongoose_1.default.connection.collection('subscriptions').findOne({
            $or: [{ companyId: hondaId }, { companyId: hondaId.toString() }, { orgId: hondaId }, { orgId: hondaId.toString() }]
        });
        const subId = sub ? sub._id : (hondaComp.subscriptionId || new mongoose_1.default.Types.ObjectId());
        await mongoose_1.default.connection.collection('subscriptions').updateOne({ _id: subId }, {
            $set: {
                _id: subId,
                companyId: hondaId,
                orgId: hondaId,
                planId: enterprisePlanId,
                status: 'Active',
                billingCycle: 'Annual',
                updatedAt: new Date()
            },
            $setOnInsert: {
                createdAt: new Date()
            }
        }, { upsert: true });
        await mongoose_1.default.connection.collection('companyprofiles').updateOne({ _id: hondaId }, { $set: { subscriptionId: subId, accountStatus: 'Active', platformType: 'Enterprise' } });
        console.log('✅ Honda subscription linked to Master Enterprise Plan (424 features)! SubId:', subId);
    }
    process.exit(0);
}
run().catch(console.error);

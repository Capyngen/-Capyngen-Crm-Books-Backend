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
    const spinnyId = new mongoose_1.default.Types.ObjectId('6aa797278d301b4735f1d322');
    const spinnyStr = '6aa797278d301b4735f1d322';
    const collections = await mongoose_1.default.connection.db.listCollections().toArray();
    console.log('=== SPINNY DATA AUDIT IN MONGODB ===');
    const report = {};
    for (const c of collections) {
        const name = c.name;
        try {
            const count = await mongoose_1.default.connection.collection(name).countDocuments({
                $or: [
                    { companyId: spinnyId },
                    { companyId: spinnyStr },
                    { orgId: spinnyId },
                    { orgId: spinnyStr }
                ]
            });
            report[name] = count;
            if (count > 0) {
                console.log(`✅ ${name}: ${count} records`);
            }
            else {
                console.log(`❌ ${name}: 0 records (EMPTY)`);
            }
        }
        catch (e) {
            // Some collections might not have index or fields
        }
    }
    await mongoose_1.default.disconnect();
}
run().catch(console.error);

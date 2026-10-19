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
    const spinnyObjId = new mongoose_1.default.Types.ObjectId('6aa797278d301b4735f1d322');
    const spinnyId = '6aa797278d301b4735f1d322';
    const empId = new mongoose_1.default.Types.ObjectId('6aa797278d301b4735f1d324');
    await mongoose_1.default.connection.collection('employees').updateOne({ email: 'nitesht206@gmail.com' }, {
        $set: {
            _id: empId,
            companyId: spinnyObjId,
            orgId: spinnyId,
            firstName: 'Nitesh',
            lastName: 'Thakur',
            email: 'nitesht206@gmail.com',
            role: 'Admin',
            status: 'Active',
            updatedAt: new Date()
        },
        $setOnInsert: {
            createdAt: new Date()
        }
    }, { upsert: true });
    console.log('✅ Nitesh Thakur upserted successfully for Spinny (6aa797278d301b4735f1d322)!');
    process.exit(0);
}
run().catch(console.error);

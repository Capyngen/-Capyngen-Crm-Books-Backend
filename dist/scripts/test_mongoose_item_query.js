"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Item_1 = __importDefault(require("../domains/inventory/models/Item"));
dotenv_1.default.config();
async function testQuery() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || '');
    const spinnyStr = '6aa797278d301b4735f1d322';
    const spinnyObj = new mongoose_1.default.Types.ObjectId(spinnyStr);
    console.log('Testing raw MongoDB query...');
    const rawResults = await mongoose_1.default.connection.collection('products').find({
        $or: [
            { companyId: spinnyStr },
            { companyId: spinnyObj },
            { orgId: spinnyStr }
        ]
    }).toArray();
    console.log(`Raw MongoDB matched ${rawResults.length} items`);
    console.log('Testing Mongoose Item.find with $or...');
    const mongooseResults = await Item_1.default.find({
        $or: [
            { companyId: spinnyStr },
            { companyId: spinnyObj },
            { orgId: spinnyStr }
        ]
    }).lean();
    console.log(`Mongoose Item.find matched ${mongooseResults.length} items`);
    process.exit(0);
}
testQuery();

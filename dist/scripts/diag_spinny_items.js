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
    if (!db) {
        console.error('No DB connection');
        process.exit(1);
    }
    const spinnyStr = '6aa797278d301b4735f1d322';
    const spinnyObj = new mongoose_1.default.Types.ObjectId(spinnyStr);
    const inProductsTotal = await db.collection('products').countDocuments();
    const inProductsStr = await db.collection('products').countDocuments({ companyId: spinnyStr });
    const inProductsObj = await db.collection('products').countDocuments({ companyId: spinnyObj });
    const inProductsOrgStr = await db.collection('products').countDocuments({ orgId: spinnyStr });
    console.log({ inProductsTotal, inProductsStr, inProductsObj, inProductsOrgStr });
    const allItems = await db.collection('products').find({
        $or: [{ companyId: spinnyStr }, { companyId: spinnyObj }, { orgId: spinnyStr }]
    }).project({ name: 1, sku: 1, companyId: 1, orgId: 1 }).toArray();
    console.log('Found items count:', allItems.length);
    console.log('Items sample:', allItems.map(i => ({
        name: i.name,
        sku: i.sku,
        companyId: i.companyId,
        companyIdType: typeof i.companyId,
        isObjId: i.companyId instanceof mongoose_1.default.Types.ObjectId
    })));
    // Also check items collection and booksitems collection
    const inItemsStr = await db.collection('items').countDocuments({ companyId: spinnyStr });
    const inItemsObj = await db.collection('items').countDocuments({ companyId: spinnyObj });
    const inBooksItemsStr = await db.collection('booksitems').countDocuments({ companyId: spinnyStr });
    const inBooksItemsObj = await db.collection('booksitems').countDocuments({ companyId: spinnyObj });
    console.log({ inItemsStr, inItemsObj, inBooksItemsStr, inBooksItemsObj });
    process.exit(0);
}
run();

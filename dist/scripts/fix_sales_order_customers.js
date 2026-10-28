"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
async function fixCustomer() {
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    const db = mongoose_1.default.connection.db;
    if (!db) {
        console.error('No DB connection');
        return;
    }
    // Find a valid customer or client account
    let sampleCust = await db.collection('clientaccounts').findOne({});
    if (!sampleCust) {
        sampleCust = await db.collection('customers').findOne({});
    }
    console.log('Sample customer found:', sampleCust?._id, sampleCust?.displayName || sampleCust?.name);
    // Check sales orders with non-ObjectId customer
    const orders = await db.collection('salesorders').find({}).toArray();
    for (const o of orders) {
        const isObjId = o.customer && (o.customer instanceof mongoose_1.default.Types.ObjectId || mongoose_1.default.Types.ObjectId.isValid(o.customer));
        if (!isObjId || typeof o.customer === 'object') {
            console.log('Fixing sales order:', o._id, o.salesOrderNumber);
            const custName = typeof o.customer === 'object' ? (o.customer.displayName || o.customer.name) : o.customer;
            await db.collection('salesorders').updateOne({ _id: o._id }, {
                $set: {
                    customer: sampleCust ? sampleCust._id : new mongoose_1.default.Types.ObjectId(),
                    customerName: custName || 'Rohit Sharma (Spinny Customer)'
                }
            });
        }
    }
    console.log('Fixed sales orders successfully.');
    await mongoose_1.default.disconnect();
}
fixCustomer();

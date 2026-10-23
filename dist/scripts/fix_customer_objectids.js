"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function fixCustomerRefs() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB Atlas...');
    const db = mongoose_1.default.connection.db;
    if (!db)
        throw new Error('Database connection failed');
    const customers = await db.collection('clientaccounts').find({}).toArray();
    const nameToId = new Map();
    for (const c of customers) {
        if (c.name)
            nameToId.set(c.name.trim().toLowerCase(), c._id);
        if (c.displayName)
            nameToId.set(c.displayName.trim().toLowerCase(), c._id);
        if (c.companyName)
            nameToId.set(c.companyName.trim().toLowerCase(), c._id);
    }
    console.log(`Mapped ${nameToId.size} customer lookup keys.`);
    // 1. INVOICES
    const invoices = await db.collection('invoices').find({}).toArray();
    let invFixed = 0;
    for (const inv of invoices) {
        if (typeof inv.customer === 'string' && !mongoose_1.default.Types.ObjectId.isValid(inv.customer)) {
            const matchId = nameToId.get(inv.customer.trim().toLowerCase());
            if (matchId) {
                console.log(`Fixing invoice ${inv.invoiceNumber}: '${inv.customer}' -> ${matchId}`);
                await db.collection('invoices').updateOne({ _id: inv._id }, { $set: { customer: matchId, customerName: inv.customer } });
                invFixed++;
            }
            else {
                console.log(`Warning: No match found for invoice customer: '${inv.customer}'`);
            }
        }
    }
    console.log(`Fixed ${invFixed} invoices.`);
    // 2. PAYMENTS RECEIVED
    const pmts = await db.collection('paymentsreceived').find({}).toArray();
    let pmtsFixed = 0;
    for (const p of pmts) {
        if (typeof p.customer === 'string' && !mongoose_1.default.Types.ObjectId.isValid(p.customer)) {
            const matchId = nameToId.get(p.customer.trim().toLowerCase());
            if (matchId) {
                console.log(`Fixing payment ${p.paymentNumber}: '${p.customer}' -> ${matchId}`);
                await db.collection('paymentsreceived').updateOne({ _id: p._id }, { $set: { customer: matchId, customerName: p.customer } });
                pmtsFixed++;
            }
            else {
                console.log(`Warning: No match found for payment customer: '${p.customer}'`);
            }
        }
    }
    console.log(`Fixed ${pmtsFixed} payments.`);
    // 3. SALES ORDERS
    const sos = await db.collection('salesorders').find({}).toArray();
    let sosFixed = 0;
    for (const so of sos) {
        if (typeof so.customer === 'string' && !mongoose_1.default.Types.ObjectId.isValid(so.customer)) {
            const matchId = nameToId.get(so.customer.trim().toLowerCase());
            if (matchId) {
                console.log(`Fixing sales order ${so.salesOrderNumber}: '${so.customer}' -> ${matchId}`);
                await db.collection('salesorders').updateOne({ _id: so._id }, { $set: { customer: matchId, customerName: so.customer } });
                sosFixed++;
            }
        }
    }
    console.log(`Fixed ${sosFixed} sales orders.`);
    // 4. QUOTES
    const quotes = await db.collection('quotes').find({}).toArray();
    let quotesFixed = 0;
    for (const q of quotes) {
        if (typeof q.customer === 'string' && !mongoose_1.default.Types.ObjectId.isValid(q.customer)) {
            const matchId = nameToId.get(q.customer.trim().toLowerCase());
            if (matchId) {
                console.log(`Fixing quote ${q.quoteNumber}: '${q.customer}' -> ${matchId}`);
                await db.collection('quotes').updateOne({ _id: q._id }, { $set: { customer: matchId, customerName: q.customer } });
                quotesFixed++;
            }
        }
    }
    console.log(`Fixed ${quotesFixed} quotes.`);
    console.log('Customer ObjectId references successfully normalized!');
    await mongoose_1.default.disconnect();
}
fixCustomerRefs().catch((e) => {
    console.error('Error fixing customer references:', e);
    process.exit(1);
});

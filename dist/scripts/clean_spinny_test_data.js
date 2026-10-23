"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SPINNY_ID_STR = '6aa797278d301b4735f1d322';
const SPINNY_ID_OBJ = new mongoose_1.default.Types.ObjectId(SPINNY_ID_STR);
// Collections that MUST NEVER be deleted (to preserve login and company identity)
const PRESERVED_COLLECTIONS = new Set([
    'organizations',
    'users',
    'userorganizations'
]);
async function cleanSpinnyTestData() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp';
    console.log('Connecting to MongoDB...');
    await mongoose_1.default.connect(uri);
    const db = mongoose_1.default.connection.db;
    if (!db) {
        throw new Error('Database connection failed');
    }
    const collections = await db.listCollections().toArray();
    console.log(`Auditing and clearing Spinny test data across ${collections.length} collections...`);
    console.log(`Target Tenant Org ID: ${SPINNY_ID_STR} (Spinny)`);
    let totalDeleted = 0;
    const deletedSummary = {};
    for (const colInfo of collections) {
        const colName = colInfo.name;
        // Skip internal system collections and preserved auth/org collections
        if (colName.startsWith('system.') || PRESERVED_COLLECTIONS.has(colName)) {
            continue;
        }
        const col = db.collection(colName);
        try {
            // Find matching documents for Spinny
            const filter = {
                $or: [
                    { companyId: SPINNY_ID_OBJ },
                    { companyId: SPINNY_ID_STR },
                    { orgId: SPINNY_ID_OBJ },
                    { orgId: SPINNY_ID_STR }
                ]
            };
            const countBefore = await col.countDocuments(filter);
            if (countBefore > 0) {
                const result = await col.deleteMany(filter);
                totalDeleted += result.deletedCount;
                deletedSummary[colName] = result.deletedCount;
                console.log(`🗑️ Cleared ${result.deletedCount} records from '${colName}'`);
            }
        }
        catch (err) {
            console.warn(`⚠️ Skipped or error on collection '${colName}':`, err.message);
        }
    }
    console.log('\n=============================================');
    console.log(`✅ CLEAN SLATE COMPLETED FOR SPINNY!`);
    console.log(`Total records deleted: ${totalDeleted}`);
    console.log('Deleted breakdown:', JSON.stringify(deletedSummary, null, 2));
    console.log('=============================================');
    // Verify preserved collections
    const userOrg = await db.collection('userorganizations').find({
        $or: [{ organizationId: SPINNY_ID_OBJ }, { organizationId: SPINNY_ID_STR }, { orgId: SPINNY_ID_OBJ }, { orgId: SPINNY_ID_STR }]
    }).toArray();
    console.log(`🔒 Preserved UserOrganizations for Spinny: ${userOrg.length} links intact`);
    const orgDoc = await db.collection('organizations').findOne({ _id: SPINNY_ID_OBJ });
    console.log(`🔒 Preserved Organization doc: ${orgDoc ? orgDoc.name : 'Not found'} (_id: ${SPINNY_ID_STR})`);
    await mongoose_1.default.disconnect();
}
cleanSpinnyTestData().catch(err => {
    console.error('Fatal cleanup error:', err);
    process.exit(1);
});

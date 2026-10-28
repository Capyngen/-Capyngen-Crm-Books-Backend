"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'd:/backend/.env' });
async function check() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || '');
    const colls = await mongoose_1.default.connection.db?.listCollections().toArray();
    const names = colls?.map(c => c.name) || [];
    console.log("Matching plans/features/superadmin/catalog:", names.filter(n => /plan|feature|superadmin|catalog|module|role|sub/i.test(n)));
    // Check plans collection
    const plans = await mongoose_1.default.connection.collection("plans").find({}).project({ name: 1, slug: 1, featureKeys: 1 }).toArray();
    console.log("Plans in DB:", plans.map(p => ({ name: p.name, featureKeysCount: p.featureKeys?.length, sampleKeys: p.featureKeys?.slice(0, 10) })));
    if (names.includes('featurecatalogs') || names.includes('features') || names.includes('superadmin_features')) {
        console.log("Found explicit feature collection!");
    }
    process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });

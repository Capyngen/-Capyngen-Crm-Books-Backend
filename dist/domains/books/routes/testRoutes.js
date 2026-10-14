"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Vendor_1 = __importDefault(require("../../inventory/models/Vendor"));
const express_1 = __importDefault(require("express"));
const FiscalYear_1 = require("../models/FiscalYear");
const router = express_1.default.Router();
router.get('/test-fiscal', async (req, res) => {
    try {
        const orgId = "6aa797278d301b4735f1d322"; // Hardcode Spinny's orgId
        const years = await FiscalYear_1.FiscalYear.find({ orgId });
        res.json({ count: years.length, years });
    }
    catch (e) {
        res.json({ error: e.message });
    }
});
router.get('/fix-vendors', async (req, res) => {
    try {
        const orgId = '6aa797278d301b4735f1d322';
        const result = await Vendor_1.default.updateMany({}, { $set: { orgId: orgId, companyId: orgId } });
        res.json({ success: true, message: 'Updated', modified: result.modifiedCount });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
exports.default = router;

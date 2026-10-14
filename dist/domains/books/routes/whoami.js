"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hrmsAuth_1 = require("../../../core/middlewares/hrmsAuth");
const FiscalYear_1 = require("../models/FiscalYear");
const router = express_1.default.Router();
router.get('/whoami', hrmsAuth_1.verifyCapyngenToken, async (req, res) => {
    try {
        let orgIdRaw = req.org?._id || req.headers['x-org-id'];
        let orgId = orgIdRaw ? String(orgIdRaw) : undefined;
        const count = await FiscalYear_1.FiscalYear.countDocuments({ orgId });
        const allCount = await FiscalYear_1.FiscalYear.countDocuments({});
        res.json({
            reqOrg: req.org,
            headers: req.headers,
            resolvedOrgId: orgId,
            myFiscalCount: count,
            totalFiscalCount: allCount
        });
    }
    catch (e) {
        res.json({ error: e.message });
    }
});
exports.default = router;

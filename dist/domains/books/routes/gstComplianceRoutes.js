"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gstComplianceController_1 = require("../controllers/gstComplianceController");
const router = express_1.default.Router();
router.get('/gstr-1', gstComplianceController_1.getGSTR1);
router.get('/gstr-2b', gstComplianceController_1.getGSTR2B);
router.get('/gstr-3b', gstComplianceController_1.getGSTR3B);
router.get('/tds-26q', gstComplianceController_1.getTdsReturn);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auditLogController_1 = require("../controllers/auditLogController");
const router = express_1.default.Router();
router.get('/', auditLogController_1.getAuditLogs);
router.post('/', auditLogController_1.createAuditLog);
exports.default = router;

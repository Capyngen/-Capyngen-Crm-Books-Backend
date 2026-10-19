"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaveController_1 = require("../controllers/leaveController");
const router = express_1.default.Router();
router.get('/', leaveController_1.getLeaveApplications);
router.post('/apply', leaveController_1.applyLeave);
router.put('/:id/approve', leaveController_1.approveLeave);
router.put('/:id/reject', leaveController_1.rejectLeave);
router.get('/balances/:employeeId', leaveController_1.getLeaveBalances);
exports.default = router;

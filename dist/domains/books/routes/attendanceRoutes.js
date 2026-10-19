"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attendanceController_1 = require("../controllers/attendanceController");
const router = express_1.default.Router();
router.get('/', attendanceController_1.getAttendanceRecords);
router.get('/monthly-summary', attendanceController_1.getMonthlyAttendanceSummary);
router.post('/punch', attendanceController_1.recordPunch);
router.post('/biometric-sync', attendanceController_1.bulkSyncBiometricLogs);
exports.default = router;

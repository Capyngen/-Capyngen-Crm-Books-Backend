import express from 'express';
import {
  recordPunch,
  bulkSyncBiometricLogs,
  getAttendanceRecords,
  getMonthlyAttendanceSummary
} from '../controllers/attendanceController';

const router = express.Router();

router.get('/', getAttendanceRecords);
router.get('/monthly-summary', getMonthlyAttendanceSummary);
router.post('/punch', recordPunch);
router.post('/biometric-sync', bulkSyncBiometricLogs);

export default router;

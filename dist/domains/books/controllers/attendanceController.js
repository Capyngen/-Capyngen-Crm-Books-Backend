"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyAttendanceSummary = exports.getAttendanceRecords = exports.bulkSyncBiometricLogs = exports.recordPunch = void 0;
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Employee_1 = __importDefault(require("../models/Employee"));
const recordPunch = async (req, res) => {
    try {
        const orgId = req.org?._id || req.body.orgId || req.body.companyId || 'SYSTEM';
        const { employeeId, punchType, timestamp, notes, biometricDeviceId } = req.body;
        if (!employeeId) {
            return res.status(400).json({ success: false, message: 'employeeId is required' });
        }
        const punchDate = timestamp ? new Date(timestamp) : new Date();
        // Normalize date to midnight UTC
        const dateOnly = new Date(Date.UTC(punchDate.getUTCFullYear(), punchDate.getUTCMonth(), punchDate.getUTCDate()));
        let attendance = await Attendance_1.default.findOne({
            $or: [{ orgId }, { companyId: orgId }],
            employeeId,
            date: dateOnly
        });
        const emp = await Employee_1.default.findById(employeeId);
        if (!attendance) {
            attendance = new Attendance_1.default({
                orgId,
                companyId: orgId,
                employeeId,
                employeeCode: emp?.employeeCode,
                employeeName: emp?.employeeName,
                date: dateOnly,
                shift: req.body.shift || 'General',
                punchSource: req.body.punchSource || 'Web',
                biometricDeviceId,
                notes
            });
        }
        if (punchType === 'CHECK_IN' || (!attendance.checkIn && punchType !== 'CHECK_OUT')) {
            attendance.checkIn = punchDate;
            // Calculate late arrival assuming 9:00 AM standard shift
            const shiftStart = new Date(dateOnly);
            shiftStart.setUTCHours(9, 0, 0, 0);
            if (punchDate > shiftStart) {
                attendance.lateArrivalMinutes = Math.round((punchDate.getTime() - shiftStart.getTime()) / 60000);
            }
            attendance.status = 'Present';
        }
        else if (punchType === 'CHECK_OUT' || attendance.checkIn) {
            attendance.checkOut = punchDate;
            if (attendance.checkIn) {
                const diffHours = (punchDate.getTime() - new Date(attendance.checkIn).getTime()) / 3600000;
                attendance.totalHours = Math.round(diffHours * 100) / 100;
                if (attendance.totalHours >= 8) {
                    attendance.status = 'Present';
                    attendance.overtimeHours = Math.max(0, Math.round((attendance.totalHours - 8) * 100) / 100);
                }
                else if (attendance.totalHours >= 4) {
                    attendance.status = 'Half-Day';
                }
                else {
                    attendance.status = 'Absent';
                }
            }
        }
        const saved = await attendance.save();
        res.json({ success: true, data: saved });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Bad Request' });
    }
};
exports.recordPunch = recordPunch;
const bulkSyncBiometricLogs = async (req, res) => {
    try {
        const orgId = req.org?._id || req.body.orgId || req.body.companyId || 'SYSTEM';
        const logs = req.body.logs || []; // [{ employeeCode, timestamp, punchType, deviceId }]
        if (!Array.isArray(logs) || logs.length === 0) {
            return res.status(400).json({ success: false, message: 'Logs array is required' });
        }
        let processedCount = 0;
        for (const log of logs) {
            const emp = await Employee_1.default.findOne({
                $or: [{ orgId }, { companyId: orgId }],
                employeeCode: log.employeeCode
            });
            if (!emp)
                continue;
            const punchDate = new Date(log.timestamp);
            const dateOnly = new Date(Date.UTC(punchDate.getUTCFullYear(), punchDate.getUTCMonth(), punchDate.getUTCDate()));
            let att = await Attendance_1.default.findOne({
                $or: [{ orgId }, { companyId: orgId }],
                employeeId: emp._id,
                date: dateOnly
            });
            if (!att) {
                att = new Attendance_1.default({
                    orgId,
                    companyId: orgId,
                    employeeId: emp._id,
                    employeeCode: emp.employeeCode,
                    employeeName: emp.employeeName,
                    date: dateOnly,
                    punchSource: 'Biometric',
                    biometricDeviceId: log.deviceId
                });
            }
            if (log.punchType === 'IN' || !att.checkIn) {
                if (!att.checkIn || punchDate < att.checkIn) {
                    att.checkIn = punchDate;
                }
            }
            else if (log.punchType === 'OUT' || att.checkIn) {
                if (!att.checkOut || punchDate > att.checkOut) {
                    att.checkOut = punchDate;
                }
            }
            if (att.checkIn && att.checkOut) {
                const diffHours = (new Date(att.checkOut).getTime() - new Date(att.checkIn).getTime()) / 3600000;
                att.totalHours = Math.round(diffHours * 100) / 100;
                att.status = att.totalHours >= 8 ? 'Present' : att.totalHours >= 4 ? 'Half-Day' : 'Absent';
            }
            await att.save();
            processedCount++;
        }
        res.json({ success: true, message: `Successfully synced ${processedCount} biometric logs` });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.bulkSyncBiometricLogs = bulkSyncBiometricLogs;
const getAttendanceRecords = async (req, res) => {
    try {
        const orgId = req.org?._id || req.query.orgId || req.query.companyId;
        const query = {};
        if (orgId) {
            query.$or = [{ orgId }, { companyId: orgId }];
        }
        if (req.query.employeeId) {
            query.employeeId = req.query.employeeId;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.startDate && req.query.endDate) {
            query.date = {
                $gte: new Date(String(req.query.startDate)),
                $lte: new Date(String(req.query.endDate))
            };
        }
        const records = await Attendance_1.default.find(query).sort({ date: -1 });
        res.json({ success: true, data: records, count: records.length });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getAttendanceRecords = getAttendanceRecords;
const getMonthlyAttendanceSummary = async (req, res) => {
    try {
        const orgId = req.org?._id || req.query.orgId || req.query.companyId;
        const month = Number(req.query.month || new Date().getMonth() + 1);
        const year = Number(req.query.year || new Date().getFullYear());
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
        const query = {
            date: { $gte: startDate, $lte: endDate }
        };
        if (orgId) {
            query.$or = [{ orgId }, { companyId: orgId }];
        }
        const records = await Attendance_1.default.find(query);
        const summaryMap = new Map();
        for (const r of records) {
            const empId = r.employeeId.toString();
            if (!summaryMap.has(empId)) {
                summaryMap.set(empId, {
                    employeeId: empId,
                    employeeCode: r.employeeCode,
                    employeeName: r.employeeName,
                    presentDays: 0,
                    halfDays: 0,
                    absentDays: 0,
                    totalHours: 0,
                    overtimeHours: 0,
                    lateArrivals: 0
                });
            }
            const item = summaryMap.get(empId);
            if (r.status === 'Present')
                item.presentDays += 1;
            else if (r.status === 'Half-Day')
                item.halfDays += 1;
            else if (r.status === 'Absent')
                item.absentDays += 1;
            item.totalHours += r.totalHours || 0;
            item.overtimeHours += r.overtimeHours || 0;
            if (r.lateArrivalMinutes > 0)
                item.lateArrivals += 1;
        }
        res.json({
            success: true,
            month,
            year,
            data: Array.from(summaryMap.values())
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getMonthlyAttendanceSummary = getMonthlyAttendanceSummary;

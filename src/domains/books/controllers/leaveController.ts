import { Request, Response } from 'express';
import { LeaveApplication, LeaveBalance } from '../models/Leave';
import Employee from '../models/Employee';
import Attendance from '../models/Attendance';

export const applyLeave = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId || req.body.companyId || 'SYSTEM';
    const { employeeId, leaveType, startDate, endDate, totalDays, reason } = req.body;

    const emp = await Employee.findById(employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const application = new LeaveApplication({
      orgId,
      companyId: orgId,
      employeeId,
      employeeName: emp.employeeName,
      employeeCode: emp.employeeCode,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays: Number(totalDays || 1),
      reason,
      status: 'Pending'
    });

    const saved = await application.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Bad Request' });
  }
};

export const getLeaveApplications = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.query.orgId || req.query.companyId;
    const query: any = {};
    if (orgId) {
      query.$or = [{ orgId }, { companyId: orgId }];
    }

    if (req.query.employeeId) {
      query.employeeId = req.query.employeeId;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await LeaveApplication.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: applications, count: applications.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const approveLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const approver = req.body.approvedBy || (req as any).user?.email || 'HR Admin';

    const app = await LeaveApplication.findById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    app.status = 'Approved';
    app.approvedBy = approver;
    app.approvalDate = new Date();
    await app.save();

    // Deduct from LeaveBalance if applicable
    const year = new Date(app.startDate).getFullYear();
    let balance = await LeaveBalance.findOne({ employeeId: app.employeeId, year });
    if (!balance) {
      balance = new LeaveBalance({
        orgId: app.orgId,
        companyId: app.companyId,
        employeeId: app.employeeId,
        year
      });
    }

    if (app.leaveType === 'Paid Leave') {
      balance.paidLeave.used += app.totalDays;
      balance.paidLeave.balance = Math.max(0, balance.paidLeave.allocated - balance.paidLeave.used);
    } else if (app.leaveType === 'Casual Leave') {
      balance.casualLeave.used += app.totalDays;
      balance.casualLeave.balance = Math.max(0, balance.casualLeave.allocated - balance.casualLeave.used);
    } else if (app.leaveType === 'Sick Leave') {
      balance.sickLeave.used += app.totalDays;
      balance.sickLeave.balance = Math.max(0, balance.sickLeave.allocated - balance.sickLeave.used);
    } else if (app.leaveType === 'Loss of Pay') {
      balance.lossOfPay.used += app.totalDays;
    }

    await balance.save();

    // Sync to Attendance records for the leave period
    const start = new Date(app.startDate);
    const end = new Date(app.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateOnly = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      await Attendance.findOneAndUpdate(
        { employeeId: app.employeeId, date: dateOnly },
        {
          orgId: app.orgId,
          companyId: app.companyId,
          employeeId: app.employeeId,
          employeeCode: app.employeeCode,
          employeeName: app.employeeName,
          date: dateOnly,
          status: 'On Leave',
          notes: `${app.leaveType} Approved`
        },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: 'Leave approved successfully', data: app });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Bad Request' });
  }
};

export const rejectLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason, approvedBy } = req.body;

    const app = await LeaveApplication.findById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    app.status = 'Rejected';
    app.rejectionReason = rejectionReason || 'Not approved by manager';
    app.approvedBy = approvedBy || (req as any).user?.email || 'HR Admin';
    app.approvalDate = new Date();
    await app.save();

    res.json({ success: true, message: 'Leave application rejected', data: app });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Bad Request' });
  }
};

export const getLeaveBalances = async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.employeeId || req.query.employeeId;
    const year = Number(req.query.year || new Date().getFullYear());

    let balance = await LeaveBalance.findOne({ employeeId, year });
    if (!balance) {
      const emp = await Employee.findById(employeeId);
      balance = new LeaveBalance({
        orgId: emp?.orgId || 'SYSTEM',
        companyId: emp?.companyId || 'SYSTEM',
        employeeId,
        year
      });
      await balance.save();
    }

    res.json({ success: true, data: balance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

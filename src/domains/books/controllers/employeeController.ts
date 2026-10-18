import { Request, Response } from 'express';
import Employee from '../models/Employee';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.query.orgId || req.query.companyId;
    const query: any = {};
    if (orgId) {
      query.$or = [{ orgId }, { companyId: orgId }];
    }

    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.department) {
      query.department = req.query.department;
    }
    if (req.query.search) {
      const s = String(req.query.search);
      query.$or = [
        { employeeName: { $regex: s, $options: 'i' } },
        { employeeCode: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { designation: { $regex: s, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query).sort({ employeeCode: 1, createdAt: -1 });
    res.json({ success: true, data: employees, count: employees.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.body.orgId || req.body.companyId || 'SYSTEM';
    
    // Auto-generate employeeCode if omitted
    let employeeCode = req.body.employeeCode;
    if (!employeeCode) {
      const count = await Employee.countDocuments({ $or: [{ orgId }, { companyId: orgId }] });
      employeeCode = `EMP-${String(count + 1).padStart(3, '0')}`;
    }

    const firstName = req.body.firstName || req.body.employeeName?.split(' ')[0] || 'Employee';
    const lastName = req.body.lastName || req.body.employeeName?.split(' ').slice(1).join(' ') || '';
    const employeeName = req.body.employeeName || `${firstName} ${lastName}`.trim();

    const employee = new Employee({
      ...req.body,
      orgId,
      companyId: orgId,
      employeeCode,
      firstName,
      lastName,
      employeeName
    });

    const saved = await employee.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Bad Request' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    if (req.body.firstName || req.body.lastName) {
      const fn = req.body.firstName || '';
      const ln = req.body.lastName || '';
      if (!req.body.employeeName) {
        req.body.employeeName = `${fn} ${ln}`.trim();
      }
    }

    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Bad Request' });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const deleted = await Employee.findByIdAndUpdate(req.params.id, { status: 'Terminated' }, { new: true });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee deactivated successfully', data: deleted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getOrgHierarchy = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).org?._id || req.query.orgId || req.query.companyId;
    const query: any = { status: { $ne: 'Terminated' } };
    if (orgId) {
      query.$or = [{ orgId }, { companyId: orgId }];
    }

    const employees = await Employee.find(query).select('employeeName employeeCode department designation role managerId');

    // Build tree
    const empMap = new Map<string, any>();
    employees.forEach(e => empMap.set(e._id.toString(), { ...e.toObject(), reportees: [] }));

    const rootNodes: any[] = [];
    empMap.forEach((emp) => {
      if (emp.managerId && empMap.has(emp.managerId.toString())) {
        empMap.get(emp.managerId.toString()).reportees.push(emp);
      } else {
        rootNodes.push(emp);
      }
    });

    res.json({ success: true, data: rootNodes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

import { Router, Request, Response, NextFunction } from 'express';
import { eventBus, EVENTS } from '../core/events/eventBus';
import mongoose from 'mongoose';
import Customer from '../domains/billing/models/Customer';
import Employee from '../domains/books/models/Employee';

const router = Router();

// Middleware to ensure basic payload structure to prevent production crashes
const validateIntegrationPayload = (req: Request, res: Response, next: NextFunction) => {
  const companyId = req.body.companyId || req.body.orgId || req.headers?.['x-org-id'] || req.headers?.['x-company-id'];
  if (!companyId) {
    return res.status(400).json({ success: false, message: 'Invalid or missing companyId or orgId' });
  }
  req.body.companyId = String(companyId);
  req.body.orgId = String(companyId);
  next();
};

/**
 * Endpoint for HRMS to call when Payroll is finalized.
 * Payload: { companyId, payrollMonth, totalSalary, totalTds, totalPf, notes }
 */
router.post('/hrms/payroll-finalized', validateIntegrationPayload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, payrollMonth, totalSalary } = req.body;
    
    if (!totalSalary || typeof totalSalary !== 'number' || totalSalary <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid totalSalary amount. Must be a positive number.' });
    }

    // Trigger the synchronous EventBus. Wait for the journal to be created.
    await eventBus.emitAsync(EVENTS.PAYROLL_FINALIZED, { payrollData: req.body, companyId });

    res.status(200).json({ 
      success: true, 
      message: `Payroll finalized for ${payrollMonth || 'the month'}. Journal entry generated successfully in Books.` 
    });
  } catch (error: any) {
    console.error('[Integration Error] HRMS Payroll:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process payroll in Books', error: error.message });
  }
});

/**
 * Endpoint for CRM to call when a Deal is Won.
 * Payload: { companyId, customerId?, customerName?, customerEmail?, dealName, dealAmount, currency }
 */
router.post('/crm/deal-won', validateIntegrationPayload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, dealName, dealAmount } = req.body;
    let customerId = req.body.customerId || req.body.clientId;

    if (!dealAmount || typeof dealAmount !== 'number' || dealAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid dealAmount. Must be a positive number.' });
    }

    // If customerId is not a valid ObjectId or not provided, auto-resolve or provision Customer
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      const existingCustomer = await Customer.findOne({
        $or: [{ orgId: companyId }, { companyId }],
        email: req.body.customerEmail || 'inbound-crm@client.com'
      });

      if (existingCustomer) {
        customerId = existingCustomer._id;
      } else {
        const newCustomer = new Customer({
          orgId: companyId,
          companyId,
          name: req.body.customerName || req.body.clientName || dealName || 'CRM Inbound Customer',
          email: req.body.customerEmail || `client-${Date.now()}@inbound-crm.com`,
          phone: req.body.customerPhone || '+1 555-0100',
          status: 'Active'
        });
        await newCustomer.save();
        customerId = newCustomer._id;
      }
    }

    req.body.customerId = customerId;

    // Trigger the EventBus to create a Draft Quote in Billing
    await eventBus.emitAsync(EVENTS.CRM_DEAL_WON, { dealData: req.body, companyId });

    res.status(200).json({ 
      success: true, 
      message: 'Deal Won event received. Draft Quote generated successfully in Billing.',
      customerId
    });
  } catch (error: any) {
    console.error('[Integration Error] CRM Deal Won:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process deal in Billing', error: error.message });
  }
});

/**
 * Endpoint for CRM to sync contacts directly into Books Customer directory
 */
router.post('/crm/contact-sync', validateIntegrationPayload, async (req: Request, res: Response) => {
  try {
    const { companyId, name, email, phone, company, address } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Customer name and email are required' });
    }

    let customer = await Customer.findOne({
      $or: [{ orgId: companyId }, { companyId }],
      email
    });

    if (customer) {
      customer.name = name;
      if (phone) customer.phone = phone;
      if (company) customer.companyName = company;
      await customer.save();
    } else {
      customer = new Customer({
        orgId: companyId,
        companyId,
        name,
        email,
        phone: phone || '',
        companyName: company || name,
        status: 'Active'
      });
      await customer.save();
    }

    res.status(200).json({ success: true, message: 'Customer synced successfully', customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error syncing contact' });
  }
});

/**
 * Endpoint for HRMS to sync employees into Books / Project Timesheets directory
 */
router.post('/hrms/employee-sync', validateIntegrationPayload, async (req: Request, res: Response) => {
  try {
    const { companyId, employeeCode, firstName, lastName, email, department, designation, costRate, billingRate } = req.body;
    if (!employeeCode || !email) {
      return res.status(400).json({ success: false, message: 'Employee code and email are required' });
    }

    let emp = await Employee.findOne({
      $and: [
        { $or: [{ orgId: companyId }, { companyId }] },
        { $or: [{ employeeCode }, { email }] }
      ]
    });

    const displayName = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];

    if (emp) {
      emp.firstName = firstName || emp.firstName;
      emp.lastName = lastName || emp.lastName;
      emp.displayName = displayName;
      emp.department = department || emp.department;
      emp.designation = designation || emp.designation;
      if (costRate) emp.costRate = Number(costRate);
      if (billingRate) emp.billingRate = Number(billingRate);
      await emp.save();
    } else {
      emp = new Employee({
        orgId: companyId,
        companyId,
        employeeCode,
        firstName: firstName || displayName,
        lastName: lastName || '',
        displayName,
        email,
        department: department || 'General',
        designation: designation || 'Staff',
        status: 'Active',
        costRate: Number(costRate) || 500,
        billingRate: Number(billingRate) || 1200
      });
      await emp.save();
    }

    res.status(200).json({ success: true, message: 'Employee synced successfully', employee: emp });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error syncing employee' });
  }
});

export default router;

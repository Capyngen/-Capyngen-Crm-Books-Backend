import { Router, Request, Response, NextFunction } from 'express';
import { eventBus, EVENTS } from '../core/events/eventBus';
import mongoose from 'mongoose';

const router = Router();

// Middleware to ensure basic payload structure to prevent production crashes
const validateIntegrationPayload = (req: Request, res: Response, next: NextFunction) => {
  const { companyId } = req.body;
  if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({ success: false, message: 'Invalid or missing companyId' });
  }
  next();
};

/**
 * Endpoint for HRMS (Other Developer) to call when Payroll is finalized.
 * Payload: { companyId, payrollMonth, totalSalary, totalTds, totalPf, notes }
 */
router.post('/hrms/payroll-finalized', validateIntegrationPayload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, payrollMonth, totalSalary } = req.body;
    
    if (!totalSalary || typeof totalSalary !== 'number' || totalSalary <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid totalSalary amount' });
    }

    // Trigger the synchronous EventBus. Wait for the journal to be created.
    // If journal creation fails (e.g., math error), it throws and goes to catch block.
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
 * Endpoint for CRM (Other Developer) to call when a Deal is Won.
 * Payload: { companyId, customerId, dealName, dealAmount, currency }
 */
router.post('/crm/deal-won', validateIntegrationPayload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, customerId, dealAmount } = req.body;

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing customerId (ClientAccount ObjectId)' });
    }
    
    if (!dealAmount || typeof dealAmount !== 'number' || dealAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid dealAmount' });
    }

    // Trigger the EventBus to create a Draft Quote in Billing
    await eventBus.emitAsync(EVENTS.CRM_DEAL_WON, { dealData: req.body, companyId });

    res.status(200).json({ 
      success: true, 
      message: 'Deal Won event received. Draft Quote generated successfully in Billing.' 
    });
  } catch (error: any) {
    console.error('[Integration Error] CRM Deal Won:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process deal in Billing', error: error.message });
  }
});

export default router;

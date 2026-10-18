import { eventBus, EVENTS } from '../../../core/events/eventBus';
import Quote from '../models/Quote';
import mongoose from 'mongoose';

// Listen to CRM_DEAL_WON and generate a Draft Quote
eventBus.on(EVENTS.CRM_DEAL_WON, async (payload: { dealData: any, companyId: string }) => {
  try {
    const { dealData, companyId } = payload;
    const { customerId, dealName, dealAmount } = dealData;

    const quoteNumber = `QT-CRM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const custId = mongoose.Types.ObjectId.isValid(customerId) 
      ? new mongoose.Types.ObjectId(customerId) 
      : new mongoose.Types.ObjectId();

    const quote = new Quote({
      companyId,
      orgId: companyId,
      customer: custId,
      quoteNumber,
      quoteDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      referenceNumber: dealName || 'Inbound CRM Deal',
      items: [
        {
          description: `Generated from CRM Deal: ${dealName || 'Won Deal'}`,
          quantity: 1,
          rate: Number(dealAmount) || 0,
          amount: Number(dealAmount) || 0
        }
      ],
      subTotal: Number(dealAmount) || 0,
      total: Number(dealAmount) || 0,
      status: 'Draft',
      approvalStatus: 'Draft'
    });

    await quote.save();
    console.log(`[Integration] Successfully generated Quote ${quoteNumber} from CRM deal "${dealName}"`);
  } catch (error: any) {
    console.error(`[Integration Error] Failed to generate Quote from CRM Deal:`, error.message);
    throw error;
  }
});

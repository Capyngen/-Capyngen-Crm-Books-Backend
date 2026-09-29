import mongoose from 'mongoose';
import OrganizationSettings from '../models/OrganizationSettings';
import ExchangeRate from '../models/ExchangeRate';
import CurrencyAdjustment from '../models/CurrencyAdjustment';
import Invoice from '../../billing/models/Invoice';
import Bill from '../../inventory/models/Bill';
import { LedgerService } from './ledgerService';

export class CurrencyService {

  static async getInvoiceCurrentBaseBalance(invoiceId: string) {
    const inv = await Invoice.findById(invoiceId).lean();
    if (!inv) return 0;
    
    // Original base value of the UNPAID portion?
    // Wait, let's just get the total current base value of the remaining foreign balance.
    // Every time an adjustment runs, it records the newBaseValue of the remaining foreign balance.
    // So the easiest way is to find the MOST RECENT CurrencyAdjustment for this invoice.
    const latestAdj = await CurrencyAdjustment.findOne({ 'details.transactionId': invoiceId.toString() }).sort({ adjustmentDate: -1 }).lean();
    
    let currentBaseBalance = 0;
    if (latestAdj) {
       const detail = latestAdj.details.find((d:any) => d.transactionId === invoiceId.toString());
       currentBaseBalance = detail.newBaseValue;
    } else {
       // No adjustments yet, use original rate
       const foreignBalance = (inv.total || 0) - ((inv as any).amountPaid || 0);
       currentBaseBalance = foreignBalance * (inv.exchangeRate || 1);
    }
    
    return currentBaseBalance;
  }


  static async getBaseCurrency(orgId: string) {
    const settings = await OrganizationSettings.findOne({ orgId }).lean();
    return settings?.baseCurrency || 'INR'; // Fallback only if settings missing
  }

  static async getExchangeRate(orgId: string, currency: string, date: Date) {
    const rateDoc = await ExchangeRate.findOne({ orgId, currency, effectiveDate: { $lte: date } })
      .sort({ effectiveDate: -1 })
      .lean();
    return rateDoc?.rate || 1;
  }

  static async runCurrencyAdjustment(orgId: string, currency: string, adjustmentDate: Date, newExchangeRate: number) {
    // 1. Save new rate
    await ExchangeRate.create({ orgId, currency, effectiveDate: adjustmentDate, rate: newExchangeRate });

    const baseCurrency = await this.getBaseCurrency(orgId);
    
    // 2. Fetch Open Invoices (AR)
    const openInvoices = await Invoice.find({ orgId, currency, status: { $ne: 'Draft' } }).lean();
    
    // 3. Fetch Open Bills (AP)
    const openBills = await Bill.find({ orgId, currency, status: { $ne: 'Draft' } }).lean();

    let totalGainOrLoss = 0;
    const details: any[] = [];
    const glLines: any[] = [];

    // Process AR
    for (const inv of openInvoices) {
      // In Zoho, you only revalue the unpaid portion
      const amountPaid = (inv as any).amountPaid || 0; // naive for now, or just use balanceDue if exists
      const foreignBalance = (inv.total || 0) - amountPaid; 
      
      if (foreignBalance > 0) {
        const oldBaseValue = foreignBalance * (inv.exchangeRate || 1);
        const newBaseValue = foreignBalance * newExchangeRate;
        const gainOrLoss = newBaseValue - oldBaseValue; // Higher rate = more base currency = Gain for AR
        
        if (gainOrLoss !== 0) {
          totalGainOrLoss += gainOrLoss;
          details.push({
            transactionId: inv._id.toString(),
            transactionType: 'Invoice',
            foreignBalance,
            oldBaseValue,
            newBaseValue,
            gainOrLoss
          });
          
          if (gainOrLoss > 0) {
             glLines.push({ accountId: 'Accounts Receivable', debit: gainOrLoss, contactId: inv.customer?.toString() });
             glLines.push({ accountId: 'Unrealized Exchange Gain/Loss', credit: gainOrLoss });
          } else {
             glLines.push({ accountId: 'Unrealized Exchange Gain/Loss', debit: Math.abs(gainOrLoss) });
             glLines.push({ accountId: 'Accounts Receivable', credit: Math.abs(gainOrLoss), contactId: inv.customer?.toString() });
          }
        }
      }
    }

    // Process AP
    for (const bill of openBills) {
      const foreignBalance = (bill.totalAmount || 0); // simplifed
      if (foreignBalance > 0) {
        const oldBaseValue = foreignBalance * (bill.exchangeRate || 1);
        const newBaseValue = foreignBalance * newExchangeRate;
        // For AP, higher rate = owe more base currency = Loss
        const gainOrLoss = oldBaseValue - newBaseValue; 
        
        if (gainOrLoss !== 0) {
          totalGainOrLoss += gainOrLoss;
          details.push({
            transactionId: bill._id.toString(),
            transactionType: 'Bill',
            foreignBalance,
            oldBaseValue,
            newBaseValue,
            gainOrLoss
          });
          
          if (gainOrLoss > 0) {
             // Gain means newBaseValue is lower, so AP goes down
             glLines.push({ accountId: 'Accounts Payable', debit: gainOrLoss });
             glLines.push({ accountId: 'Unrealized Exchange Gain/Loss', credit: gainOrLoss });
          } else {
             glLines.push({ accountId: 'Unrealized Exchange Gain/Loss', debit: Math.abs(gainOrLoss) });
             glLines.push({ accountId: 'Accounts Payable', credit: Math.abs(gainOrLoss) });
          }
        }
      }
    }

    // Generate Adjustment Record
    const adjustment = await CurrencyAdjustment.create({
      orgId,
      adjustmentDate,
      adjustedCurrency: currency,
      newExchangeRate,
      totalGainOrLoss,
      details
    });

    // Post GL Impact
    if (glLines.length > 0) {
      await LedgerService.postTransaction(orgId, adjustment._id.toString(), 'CurrencyAdjustment', adjustmentDate, glLines);
    }

    return adjustment;
  }
}

import { Request, Response } from 'express';
import CurrencyAdjustment from '../models/CurrencyAdjustment';
import { CurrencyService } from '../services/currencyService';
import Invoice from '../../billing/models/Invoice';
import Bill from '../../inventory/models/Bill';

const getOrgId = (req: any): string => {
  return String(req.org?._id || req.headers?.['x-org-id'] || 'default-org');
};

export const getCurrencyAdjustments = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const adjustments = await CurrencyAdjustment.find({ orgId }).sort({ adjustmentDate: -1, createdAt: -1 });
    res.json(adjustments);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const getCurrencyAdjustmentById = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const adjustment = await CurrencyAdjustment.findOne({ _id: req.params.id, orgId });
    if (!adjustment) return res.status(404).json({ message: 'Adjustment not found' });
    res.json(adjustment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const createCurrencyAdjustment = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { currency, adjustmentDate, newExchangeRate } = req.body;

    if (!currency || !newExchangeRate) {
      return res.status(400).json({ message: 'Currency and newExchangeRate are required' });
    }

    const date = new Date(adjustmentDate || Date.now());
    const rate = Number(newExchangeRate);

    // Run enterprise forex revaluation service:
    // Calculates unrealized gain/loss on all open AR invoices & AP bills, saves CurrencyAdjustment doc, and posts to GL
    const adjustment = await CurrencyService.runCurrencyAdjustment(orgId, currency, date, rate);

    res.status(201).json({
      success: true,
      message: `Forex adjustment completed for ${currency} at rate ${rate}`,
      adjustment
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error processing currency adjustment' });
  }
};

export const getOpenForeignBalances = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { currency, proposedRate } = req.query;

    const baseCurrency = await CurrencyService.getBaseCurrency(orgId);
    const filterCurrency = currency ? String(currency) : { $ne: baseCurrency };

    // Fetch open invoices
    const openInvoices: any[] = await (Invoice.find({
      orgId,
      currency: filterCurrency,
      status: { $in: ['Sent', 'Partially Paid', 'Overdue'] }
    } as any) as any).select('invoiceNumber customer total amountPaid exchangeRate currency dueDate').lean();

    // Fetch open bills
    const openBills: any[] = await (Bill.find({
      orgId,
      currency: filterCurrency,
      status: { $in: ['Open', 'Partially Paid', 'Overdue'] }
    } as any) as any).select('billNumber vendor totalAmount paidAmount exchangeRate currency dueDate').lean();

    const rate = Number(proposedRate) || 0;

    const previewInvoices = openInvoices.map((inv: any) => {
      const foreignBalance = (inv.total || 0) - (inv.amountPaid || 0);
      const currentBaseValue = foreignBalance * (inv.exchangeRate || 1);
      const revaluedBaseValue = rate > 0 ? foreignBalance * rate : currentBaseValue;
      const unrealizedGainLoss = revaluedBaseValue - currentBaseValue;

      return {
        _id: inv._id,
        docType: 'Invoice',
        docNumber: inv.invoiceNumber,
        currency: inv.currency,
        foreignBalance,
        bookingRate: inv.exchangeRate || 1,
        currentBaseValue,
        revaluedBaseValue,
        unrealizedGainLoss
      };
    });

    const previewBills = openBills.map((bill: any) => {
      const foreignBalance = (bill.totalAmount || 0) - (bill.paidAmount || 0);
      const currentBaseValue = foreignBalance * (bill.exchangeRate || 1);
      const revaluedBaseValue = rate > 0 ? foreignBalance * rate : currentBaseValue;
      // For AP, increase in base cost = loss
      const unrealizedGainLoss = currentBaseValue - revaluedBaseValue;

      return {
        _id: bill._id,
        docType: 'Bill',
        docNumber: bill.billNumber,
        currency: bill.currency,
        foreignBalance,
        bookingRate: bill.exchangeRate || 1,
        currentBaseValue,
        revaluedBaseValue,
        unrealizedGainLoss
      };
    });

    const totalProjectedGainLoss = [...previewInvoices, ...previewBills].reduce(
      (sum, item) => sum + item.unrealizedGainLoss,
      0
    );

    res.json({
      baseCurrency,
      currency: currency || 'All Foreign',
      proposedRate: rate,
      totalProjectedGainLoss,
      openInvoices: previewInvoices,
      openBills: previewBills
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching foreign balances' });
  }
};

export const updateCurrencyAdjustment = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const updated = await CurrencyAdjustment.findOneAndUpdate({ _id: req.params.id, orgId }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const deleteCurrencyAdjustment = async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const deleted = await CurrencyAdjustment.findOneAndDelete({ _id: req.params.id, orgId });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

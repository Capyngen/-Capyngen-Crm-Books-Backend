import { Request, Response } from 'express';
import { Tax } from '../models/Tax';
import { WithholdingTax } from '../models/WithholdingTax';
import { ChartOfAccount } from '../models/ChartOfAccount'; // needed for population if desired

// --- TAX RATES & GROUPS ---

export const getTaxes = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const taxes = await Tax.find({ orgId }).sort({ regime: 1, name: 1 }).populate('components.accountId', 'name code').lean();
    res.json(taxes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createTax = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const { name, regime, taxType, components = [] } = req.body;

    // Calculate total effective rate
    let totalRate = 0;
    if (Array.isArray(components)) {
      for (const comp of components) {
        if (comp.isCompound) {
          totalRate += ((100 + totalRate) * comp.rate) / 100;
        } else {
          totalRate += Number(comp.rate);
        }
      }
    }

    const tax = new Tax({ orgId, name, regime, taxType, components, totalRate });
    const saved = await tax.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error creating Tax' });
  }
};

export const deleteTax = async (req: Request, res: Response) => {
  try {
    await Tax.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tax deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- WITHHOLDING TAXES (TDS/TCS) ---

export const getWithholdingTaxes = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const taxes = await WithholdingTax.find({ orgId }).sort({ sectionCode: 1 }).populate('accountId', 'name code').lean();
    res.json(taxes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createWithholdingTax = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const tax = new WithholdingTax({ ...req.body, orgId });
    const saved = await tax.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error creating Withholding Tax' });
  }
};

export const deleteWithholdingTax = async (req: Request, res: Response) => {
  try {
    await WithholdingTax.findByIdAndDelete(req.params.id);
    res.json({ message: 'Withholding Tax deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

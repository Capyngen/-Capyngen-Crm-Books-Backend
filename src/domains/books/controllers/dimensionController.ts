import { Request, Response } from 'express';
import { FinancialDimension } from '../models/FinancialDimension';
import Branch from '../models/Branch';

// =======================
// Financial Dimensions
// =======================

export const getDimensions = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const filter: any = orgId ? { orgId } : {};
    
    // Explicitly use .lean() to return plain JSON objects, preventing the raw Mongoose _doc UI bug!
    const dimensions = await FinancialDimension.find(filter).sort({ createdAt: -1 }).lean();
    res.json(dimensions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getDimensionById = async (req: Request, res: Response) => {
  try {
    const dim = await FinancialDimension.findById(req.params.id).lean();
    if (!dim) return res.status(404).json({ message: 'Not found' });
    res.json(dim);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createDimension = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const payload = { ...req.body, orgId };
    const dimension = new FinancialDimension(payload);
    const saved = await dimension.save();
    // Return lean object via toJSON
    res.status(201).json(saved.toJSON());
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const updateDimension = async (req: Request, res: Response) => {
  try {
    // Basic circular dependency check
    if (req.body.parentDimensionId && req.body.parentDimensionId === req.params.id) {
      return res.status(400).json({ message: 'Cannot be its own parent.' });
    }

    const updated = await FinancialDimension.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const deleteDimension = async (req: Request, res: Response) => {
  try {
    const deleted = await FinancialDimension.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// =======================
// Branches
// =======================

export const getBranches = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    const filter: any = orgId ? { orgId } : {};
    
    const branches = await Branch.find(filter).sort({ createdAt: -1 }).lean();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getBranchById = async (req: Request, res: Response) => {
  try {
    const branch = await Branch.findById(req.params.id).lean();
    if (!branch) return res.status(404).json({ message: 'Not found' });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createBranch = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    
    // If setting as primary, unset other primaries
    if (req.body.isPrimary && orgId) {
      await Branch.updateMany({ orgId }, { $set: { isPrimary: false } });
    }

    const payload = { ...req.body, orgId };
    const branch = new Branch(payload);
    const saved = await branch.save();
    res.status(201).json(saved.toJSON());
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const updateBranch = async (req: Request | any, res: Response) => {
  try {
    const orgId = req.org?._id || req.headers['x-org-id'];
    
    if (req.body.isPrimary && orgId) {
      await Branch.updateMany({ orgId, _id: { $ne: req.params.id } }, { $set: { isPrimary: false } });
    }

    const updated = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const deleted = await Branch.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

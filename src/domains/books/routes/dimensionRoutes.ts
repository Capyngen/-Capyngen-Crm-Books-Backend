import express from 'express';
import { 
  getDimensions, getDimensionById, createDimension, updateDimension, deleteDimension,
  getBranches, getBranchById, createBranch, updateBranch, deleteBranch
} from '../controllers/dimensionController';

export const dimensionRoutes = express.Router();
dimensionRoutes.get('/', getDimensions);
dimensionRoutes.get('/:id', getDimensionById);
dimensionRoutes.post('/', createDimension);
dimensionRoutes.put('/:id', updateDimension);
dimensionRoutes.delete('/:id', deleteDimension);

export const branchRoutes = express.Router();
branchRoutes.get('/', getBranches);
branchRoutes.get('/:id', getBranchById);
branchRoutes.post('/', createBranch);
branchRoutes.put('/:id', updateBranch);
branchRoutes.delete('/:id', deleteBranch);

import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectProfitability,
  invoiceProjectTimesheets
} from '../controllers/projectController';

const router = express.Router();

router.get('/:id/profitability', getProjectProfitability);
router.post('/:id/invoice-timesheets', invoiceProjectTimesheets);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;

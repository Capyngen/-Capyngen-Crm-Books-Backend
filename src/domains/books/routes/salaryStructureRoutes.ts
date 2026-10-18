import express from 'express';
import {
  createOrUpdateSalaryStructure,
  getSalaryStructureByEmployee,
  getAllSalaryStructures
} from '../controllers/salaryStructureController';

const router = express.Router();

router.get('/', getAllSalaryStructures);
router.get('/employee/:employeeId', getSalaryStructureByEmployee);
router.post('/', createOrUpdateSalaryStructure);

export default router;

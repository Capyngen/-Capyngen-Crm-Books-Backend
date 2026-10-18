import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getOrgHierarchy
} from '../controllers/employeeController';

const router = express.Router();

router.get('/', getEmployees);
router.get('/hierarchy', getOrgHierarchy);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;

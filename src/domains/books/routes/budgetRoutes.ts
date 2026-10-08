import express from 'express';
import { getScenarios, createScenario, getScenarioDetails, saveBudgetLines, getBudgetVariance } from '../controllers/budgetController';

const router = express.Router();

router.get('/scenarios', getScenarios);
router.post('/scenarios', createScenario);
router.get('/scenarios/:id', getScenarioDetails);
router.post('/scenarios/:id/lines', saveBudgetLines);
router.get('/scenarios/:id/variance', getBudgetVariance);

export default router;

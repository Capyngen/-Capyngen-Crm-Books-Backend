import express from 'express';
import { 
  getTaxes, 
  createTax, 
  deleteTax,
  getWithholdingTaxes,
  createWithholdingTax,
  deleteWithholdingTax 
} from '../controllers/taxController';

const router = express.Router();

router.get('/', getTaxes);
router.post('/', createTax);
router.delete('/:id', deleteTax);

router.get('/withholding', getWithholdingTaxes);
router.post('/withholding', createWithholdingTax);
router.delete('/withholding/:id', deleteWithholdingTax);

export default router;

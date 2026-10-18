import express from 'express';
import { getCashForecast } from '../controllers/treasuryForecastController';

const router = express.Router();

router.get('/forecast', getCashForecast);

export default router;

import express from 'express';
import { classifyAccount, suggestDimensions, detectAnomalies } from '../controllers/aiController';

export const aiRoutes = express.Router();

aiRoutes.post('/classify-account', classifyAccount);
aiRoutes.post('/suggest-dimensions', suggestDimensions);
aiRoutes.post('/detect-anomalies', detectAnomalies);

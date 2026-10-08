import express from 'express';
import { getFiscalYears, createFiscalYear, togglePeriodLock, toggleYearLock } from '../controllers/fiscalCalendarController';

export const fiscalCalendarRoutes = express.Router();

fiscalCalendarRoutes.get('/', getFiscalYears);
fiscalCalendarRoutes.post('/', createFiscalYear);
fiscalCalendarRoutes.patch('/:id/periods/:periodId/lock', togglePeriodLock);
fiscalCalendarRoutes.patch('/:id/lock', toggleYearLock);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiscalCalendarRoutes = void 0;
const express_1 = __importDefault(require("express"));
const fiscalCalendarController_1 = require("../controllers/fiscalCalendarController");
exports.fiscalCalendarRoutes = express_1.default.Router();
exports.fiscalCalendarRoutes.get('/', fiscalCalendarController_1.getFiscalYears);
exports.fiscalCalendarRoutes.post('/', fiscalCalendarController_1.createFiscalYear);
exports.fiscalCalendarRoutes.patch('/:id/periods/:periodId/lock', fiscalCalendarController_1.togglePeriodLock);
exports.fiscalCalendarRoutes.patch('/:id/lock', fiscalCalendarController_1.toggleYearLock);

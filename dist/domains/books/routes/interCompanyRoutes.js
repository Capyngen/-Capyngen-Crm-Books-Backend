"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interCompanyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const interCompanyController_1 = require("../controllers/interCompanyController");
exports.interCompanyRoutes = express_1.default.Router();
exports.interCompanyRoutes.get('/', interCompanyController_1.getTransactions);
exports.interCompanyRoutes.post('/', interCompanyController_1.createTransaction);
exports.interCompanyRoutes.post('/:id/approve', interCompanyController_1.approveTransaction);

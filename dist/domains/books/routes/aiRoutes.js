"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRoutes = void 0;
const express_1 = __importDefault(require("express"));
const aiController_1 = require("../controllers/aiController");
exports.aiRoutes = express_1.default.Router();
exports.aiRoutes.post('/classify-account', aiController_1.classifyAccount);
exports.aiRoutes.post('/suggest-dimensions', aiController_1.suggestDimensions);
exports.aiRoutes.post('/detect-anomalies', aiController_1.detectAnomalies);

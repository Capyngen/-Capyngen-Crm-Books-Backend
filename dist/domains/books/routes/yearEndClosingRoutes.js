"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const yearEndClosingController_1 = require("../controllers/yearEndClosingController");
const router = express_1.default.Router();
router.get('/fiscal-years', yearEndClosingController_1.getFiscalYears);
router.get('/preview/:fiscalYearId', yearEndClosingController_1.previewClosing);
router.post('/execute/:fiscalYearId', yearEndClosingController_1.executeClosing);
exports.default = router;

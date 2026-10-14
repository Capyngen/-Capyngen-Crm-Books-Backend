"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taxController_1 = require("../controllers/taxController");
const router = express_1.default.Router();
router.get('/', taxController_1.getTaxes);
router.post('/', taxController_1.createTax);
router.delete('/:id', taxController_1.deleteTax);
router.get('/withholding', taxController_1.getWithholdingTaxes);
router.post('/withholding', taxController_1.createWithholdingTax);
router.delete('/withholding/:id', taxController_1.deleteWithholdingTax);
exports.default = router;

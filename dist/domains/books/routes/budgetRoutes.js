"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const budgetController_1 = require("../controllers/budgetController");
const router = express_1.default.Router();
router.get('/scenarios', budgetController_1.getScenarios);
router.post('/scenarios', budgetController_1.createScenario);
router.get('/scenarios/:id', budgetController_1.getScenarioDetails);
router.post('/scenarios/:id/lines', budgetController_1.saveBudgetLines);
router.get('/scenarios/:id/variance', budgetController_1.getBudgetVariance);
router.post('/check-threshold', budgetController_1.checkBudgetThreshold);
exports.default = router;

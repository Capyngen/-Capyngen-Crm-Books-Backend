"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const salaryStructureController_1 = require("../controllers/salaryStructureController");
const router = express_1.default.Router();
router.get('/', salaryStructureController_1.getAllSalaryStructures);
router.get('/employee/:employeeId', salaryStructureController_1.getSalaryStructureByEmployee);
router.post('/', salaryStructureController_1.createOrUpdateSalaryStructure);
exports.default = router;

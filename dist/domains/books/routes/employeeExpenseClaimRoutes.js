"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employeeExpenseClaimController_1 = require("../controllers/employeeExpenseClaimController");
const router = express_1.default.Router();
router.get('/', employeeExpenseClaimController_1.getClaims);
router.post('/', employeeExpenseClaimController_1.createClaim);
router.get('/:id', employeeExpenseClaimController_1.getClaimById);
router.put('/:id/submit', employeeExpenseClaimController_1.submitClaim);
router.put('/:id/manager-approve', employeeExpenseClaimController_1.managerApproveClaim);
router.put('/:id/finance-approve', employeeExpenseClaimController_1.financeApproveClaim);
router.put('/:id/reimburse', employeeExpenseClaimController_1.reimburseClaim);
exports.default = router;

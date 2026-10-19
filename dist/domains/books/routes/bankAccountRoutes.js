"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bankAccountController_1 = require("../controllers/bankAccountController");
const router = express_1.default.Router();
router.get('/summary', bankAccountController_1.getBankFeedSummary);
router.get('/', bankAccountController_1.getBankAccounts);
router.get('/:id', bankAccountController_1.getBankAccountById);
router.post('/', bankAccountController_1.createBankAccount);
router.put('/:id', bankAccountController_1.updateBankAccount);
router.delete('/:id', bankAccountController_1.deleteBankAccount);
router.post('/import-statement', bankAccountController_1.importBankStatement);
exports.default = router;

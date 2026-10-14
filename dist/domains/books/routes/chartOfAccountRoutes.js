"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chartOfAccountController_1 = require("../controllers/chartOfAccountController");
const router = express_1.default.Router();
router.get('/', chartOfAccountController_1.getAccounts);
router.get('/:id', chartOfAccountController_1.getAccountById);
router.post('/', chartOfAccountController_1.createAccount);
router.put('/:id', chartOfAccountController_1.updateAccount);
router.delete('/:id', chartOfAccountController_1.deleteAccount);
exports.default = router;

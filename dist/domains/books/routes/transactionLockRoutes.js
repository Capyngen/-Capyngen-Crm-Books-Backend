"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transactionLockController_1 = require("../controllers/transactionLockController");
const router = express_1.default.Router();
router.get('/', transactionLockController_1.getTransactionLock);
router.put('/', transactionLockController_1.updateTransactionLock);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recurringJournalController_1 = require("../controllers/recurringJournalController");
const router = express_1.default.Router();
router.get('/', recurringJournalController_1.getRecurringJournals);
router.get('/:id', recurringJournalController_1.getRecurringJournalById);
router.post('/', recurringJournalController_1.createRecurringJournal);
router.patch('/:id/status', recurringJournalController_1.updateRecurringJournalStatus);
router.delete('/:id', recurringJournalController_1.deleteRecurringJournal);
exports.default = router;

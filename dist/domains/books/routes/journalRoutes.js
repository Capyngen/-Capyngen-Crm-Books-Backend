"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const journalController_1 = require("../controllers/journalController");
const router = express_1.default.Router();
router.get('/', journalController_1.getJournals);
router.get('/:id', journalController_1.getJournalById);
router.post('/', journalController_1.createJournal);
router.put('/:id', journalController_1.updateJournal);
router.delete('/:id', journalController_1.deleteJournal);
router.post('/:id/reverse', journalController_1.reverseJournal);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const timeEntryController_1 = require("../controllers/timeEntryController");
const router = express_1.default.Router();
router.get('/', timeEntryController_1.getTimeEntries);
router.get('/:id', timeEntryController_1.getTimeEntryById);
router.post('/', timeEntryController_1.createTimeEntry);
router.put('/:id', timeEntryController_1.updateTimeEntry);
router.delete('/:id', timeEntryController_1.deleteTimeEntry);
exports.default = router;

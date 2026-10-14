"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const creditNoteController_1 = require("../../billing/controllers/creditNoteController");
const router = express_1.default.Router();
router.route('/')
    .post(creditNoteController_1.createCreditNote)
    .get(creditNoteController_1.getCreditNotes);
router.route('/:id')
    .get(creditNoteController_1.getCreditNoteById)
    .put(creditNoteController_1.updateCreditNote)
    .delete(creditNoteController_1.deleteCreditNote);
exports.default = router;

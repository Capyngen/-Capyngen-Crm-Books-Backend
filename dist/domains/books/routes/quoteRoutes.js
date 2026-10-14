"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quoteController_1 = require("../../billing/controllers/quoteController");
const router = (0, express_1.Router)();
router.route('/')
    .get(quoteController_1.getQuotes)
    .post(quoteController_1.createQuote);
router.route('/:id')
    .get(quoteController_1.getQuoteById)
    .put(quoteController_1.updateQuote)
    .delete(quoteController_1.deleteQuote);
exports.default = router;

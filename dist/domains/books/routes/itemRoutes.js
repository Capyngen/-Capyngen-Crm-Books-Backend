"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const itemController_1 = require("../controllers/itemController");
const router = (0, express_1.Router)();
router.route('/')
    .get(itemController_1.getItems)
    .post(itemController_1.createItem);
router.route('/:id')
    .get(itemController_1.getItemById)
    .put(itemController_1.updateItem);
exports.default = router;

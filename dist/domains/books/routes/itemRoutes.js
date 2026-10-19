"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const itemController_1 = require("../../inventory/controllers/itemController");
const router = (0, express_1.Router)();
router.route('/')
    .get(itemController_1.getItems)
    .post(itemController_1.createItem);
router.route('/:id')
    .get(itemController_1.getItemById)
    .put(itemController_1.updateItem)
    .delete(itemController_1.deleteItem);
router.post('/:id/assemble', itemController_1.assembleKit);
exports.default = router;

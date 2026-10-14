"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const itemController_1 = require("../controllers/itemController");
const router = express_1.default.Router();
router.route('/')
    .get(itemController_1.getItems)
    .post(itemController_1.createItem);
router.route('/:id')
    .get(itemController_1.getItemById)
    .put(itemController_1.updateItem)
    .delete(itemController_1.deleteItem);
exports.default = router;

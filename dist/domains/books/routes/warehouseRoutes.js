"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const warehouseController_1 = require("../../inventory/controllers/warehouseController");
const router = express_1.default.Router({ mergeParams: true });
router.route('/')
    .get(warehouseController_1.getWarehouses)
    .post(warehouseController_1.createWarehouse);
router.route('/:id')
    .get(warehouseController_1.getWarehouseById)
    .put(warehouseController_1.updateWarehouse)
    .delete(warehouseController_1.deleteWarehouse);
exports.default = router;

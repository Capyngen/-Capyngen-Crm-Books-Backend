"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const salesOrderController_1 = require("../../billing/controllers/salesOrderController");
const router = express_1.default.Router();
router.route('/')
    .post(salesOrderController_1.createSalesOrder)
    .get(salesOrderController_1.getSalesOrders);
router.route('/:id')
    .get(salesOrderController_1.getSalesOrderById)
    .put(salesOrderController_1.updateSalesOrder)
    .delete(salesOrderController_1.deleteSalesOrder);
router.post('/:id/fulfill', salesOrderController_1.fulfillSalesOrder);
exports.default = router;

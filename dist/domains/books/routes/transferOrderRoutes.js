"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transferOrderController_1 = require("../../inventory/controllers/transferOrderController");
const router = express_1.default.Router({ mergeParams: true });
router.route('/')
    .get(transferOrderController_1.getTransferOrders)
    .post(transferOrderController_1.createTransferOrder);
router.route('/:id')
    .get(transferOrderController_1.getTransferOrderById)
    .put(transferOrderController_1.updateTransferOrder)
    .delete(transferOrderController_1.deleteTransferOrder);
router.post('/:id/dispatch', transferOrderController_1.dispatchTransferOrder);
router.post('/:id/receive', transferOrderController_1.receiveTransferOrder);
exports.default = router;

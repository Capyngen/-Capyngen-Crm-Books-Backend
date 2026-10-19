"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workOrderController_1 = require("../../inventory/controllers/workOrderController");
const router = express_1.default.Router({ mergeParams: true });
router.get('/bom-explosion/:itemId', workOrderController_1.getBOMExplosion);
router.route('/')
    .get(workOrderController_1.getWorkOrders)
    .post(workOrderController_1.createWorkOrder);
router.post('/:id/complete', workOrderController_1.completeWorkOrder);
router.route('/:id')
    .get(workOrderController_1.getWorkOrderById)
    .put(workOrderController_1.updateWorkOrder)
    .delete(workOrderController_1.deleteWorkOrder);
exports.default = router;

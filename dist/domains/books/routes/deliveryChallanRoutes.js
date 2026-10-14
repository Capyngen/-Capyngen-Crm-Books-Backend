"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const deliveryChallanController_1 = require("../../inventory/controllers/deliveryChallanController");
const router = express_1.default.Router();
router.route('/')
    .post(deliveryChallanController_1.createDeliveryChallan)
    .get(deliveryChallanController_1.getDeliveryChallans);
router.route('/:id')
    .get(deliveryChallanController_1.getDeliveryChallanById)
    .put(deliveryChallanController_1.updateDeliveryChallan)
    .delete(deliveryChallanController_1.deleteDeliveryChallan);
exports.default = router;

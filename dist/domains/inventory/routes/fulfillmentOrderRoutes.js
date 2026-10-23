"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fulfillmentOrderController_1 = require("../controllers/fulfillmentOrderController");
const router = express_1.default.Router({ mergeParams: true });
router.route('/')
    .get(fulfillmentOrderController_1.getFulfillments)
    .post(fulfillmentOrderController_1.createFulfillment);
router.route('/:id')
    .get(fulfillmentOrderController_1.getFulfillmentById)
    .put(fulfillmentOrderController_1.updateFulfillment)
    .delete(fulfillmentOrderController_1.deleteFulfillment);
router.post('/:id/advance-stage', fulfillmentOrderController_1.advanceStage);
exports.default = router;

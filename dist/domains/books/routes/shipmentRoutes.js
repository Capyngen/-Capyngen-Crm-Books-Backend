"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shipmentController_1 = require("../../inventory/controllers/shipmentController");
const router = express_1.default.Router({ mergeParams: true });
router.route('/')
    .get(shipmentController_1.getShipments)
    .post(shipmentController_1.createShipment);
router.route('/:id/carrier').post(shipmentController_1.integrateCarrier);
router.route('/:id')
    .get(shipmentController_1.getShipmentById)
    .put(shipmentController_1.updateShipment)
    .delete(shipmentController_1.deleteShipment);
exports.default = router;

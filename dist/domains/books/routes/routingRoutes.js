"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routingController_1 = require("../../inventory/controllers/routingController");
const router = express_1.default.Router({ mergeParams: true });
router.route('/')
    .get(routingController_1.getRoutings)
    .post(routingController_1.createRouting);
router.route('/:id')
    .get(routingController_1.getRoutingById)
    .put(routingController_1.updateRouting)
    .delete(routingController_1.deleteRouting);
exports.default = router;

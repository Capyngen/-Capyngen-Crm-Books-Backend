"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const machineController_1 = require("../../inventory/controllers/machineController");
const router = express_1.default.Router({ mergeParams: true });
router.route('/')
    .get(machineController_1.getMachines)
    .post(machineController_1.createMachine);
router.route('/:id')
    .get(machineController_1.getMachineById)
    .put(machineController_1.updateMachine)
    .delete(machineController_1.deleteMachine);
exports.default = router;

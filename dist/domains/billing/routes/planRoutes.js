"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const planController_1 = require("../controllers/planController");
const router = express_1.default.Router();
router.route('/')
    .get(planController_1.getPlans)
    .post(planController_1.createPlan);
router.route('/:id')
    .get(planController_1.getPlanById)
    .put(planController_1.updatePlan)
    .delete(planController_1.deletePlan);
exports.default = router;

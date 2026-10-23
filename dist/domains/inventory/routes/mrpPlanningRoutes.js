"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mrpPlanningController_1 = require("../controllers/mrpPlanningController");
const router = express_1.default.Router();
router.get('/', mrpPlanningController_1.getMRPPlan);
router.get('/plan', mrpPlanningController_1.getMRPPlan);
router.post('/generate-orders', mrpPlanningController_1.executeMRPOrders);
exports.default = router;

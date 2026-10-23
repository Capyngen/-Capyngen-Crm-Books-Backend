"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const salesReturnController_1 = require("../controllers/salesReturnController");
const router = express_1.default.Router({ mergeParams: true });
router.route('/')
    .get(salesReturnController_1.getSalesReturns)
    .post(salesReturnController_1.createSalesReturn);
router.route('/:id')
    .get(salesReturnController_1.getSalesReturnById)
    .put(salesReturnController_1.updateSalesReturn)
    .delete(salesReturnController_1.deleteSalesReturn);
router.post('/:id/receive', salesReturnController_1.receiveAndRestock);
exports.default = router;

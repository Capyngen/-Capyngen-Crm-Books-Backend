"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reconciliationController_1 = require("../controllers/reconciliationController");
const router = express_1.default.Router();
router.get('/', reconciliationController_1.getReconciliationFeeds);
router.get('/feeds', reconciliationController_1.getReconciliationFeeds);
router.post('/feeds/:feedId/confirm', reconciliationController_1.confirmMatch);
router.post('/feeds/:feedId/unmatch', reconciliationController_1.unmatchFeed);
router.post('/auto-reconcile', reconciliationController_1.autoReconcile);
exports.default = router;

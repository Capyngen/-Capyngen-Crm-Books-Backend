"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchaseReceiveController_1 = require("../controllers/purchaseReceiveController");
const router = (0, express_1.Router)();
router.get('/', purchaseReceiveController_1.getPurchaseReceives);
router.get('/:id', purchaseReceiveController_1.getPurchaseReceiveById);
router.post('/', purchaseReceiveController_1.createPurchaseReceive);
exports.default = router;

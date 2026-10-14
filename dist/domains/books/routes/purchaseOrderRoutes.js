"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchaseOrderController_1 = require("../../inventory/controllers/purchaseOrderController");
const router = (0, express_1.Router)();
router.route('/')
    .get(purchaseOrderController_1.getPurchaseOrders)
    .post(purchaseOrderController_1.createPurchaseOrder);
router.route('/:id')
    .get(purchaseOrderController_1.getPurchaseOrderById)
    .put(purchaseOrderController_1.updatePurchaseOrder)
    .delete(purchaseOrderController_1.deletePurchaseOrder);
exports.default = router;
router.post('/:id/request-approval', purchaseOrderController_1.requestPOApproval);
router.post('/:id/approve', purchaseOrderController_1.approvePOManager);

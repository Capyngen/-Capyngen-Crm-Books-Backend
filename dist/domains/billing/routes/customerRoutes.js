"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerController_1 = require("../controllers/customerController");
const router = express_1.default.Router();
router.route('/')
    .get(customerController_1.getCustomers)
    .post(customerController_1.createCustomer);
router.route('/:id')
    .get(customerController_1.getCustomerById)
    .put(customerController_1.updateCustomer)
    .delete(customerController_1.deleteCustomer);
exports.default = router;

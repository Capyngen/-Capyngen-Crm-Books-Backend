"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const packageController_1 = require("../../inventory/controllers/packageController");
const router = express_1.default.Router({ mergeParams: true });
router.route('/')
    .get(packageController_1.getPackages)
    .post(packageController_1.createPackage);
router.route('/:id')
    .get(packageController_1.getPackageById)
    .put(packageController_1.updatePackage)
    .delete(packageController_1.deletePackage);
exports.default = router;

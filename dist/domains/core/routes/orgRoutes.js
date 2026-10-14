"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orgController_1 = require("../controllers/orgController");
const userManagementController_1 = require("../controllers/userManagementController");
const router = express_1.default.Router();
router.post('/setup', orgController_1.setupOrganization);
router.get('/', orgController_1.getOrganizations);
router.post('/join', userManagementController_1.joinOrganization);
exports.default = router;

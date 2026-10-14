"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.post('/check-invite', authController_1.checkInviteStatus);
router.post('/accept-invite-signup', authController_1.acceptInviteSignup);
router.post('/login', authController_1.login);
router.post('/login/verify', authController_1.verifyLoginOtp);
router.post('/signup', authController_1.signup);
router.post('/signup/verify', authController_1.verifySignupOtp);
exports.default = router;

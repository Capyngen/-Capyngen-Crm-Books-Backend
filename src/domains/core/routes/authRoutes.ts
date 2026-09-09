import express from 'express';
import { login, verifyLoginOtp, signup, verifySignupOtp, checkInviteStatus, acceptInviteSignup } from '../controllers/authController';

const router = express.Router();

router.post('/check-invite', checkInviteStatus);
router.post('/accept-invite-signup', acceptInviteSignup);
router.post('/login', login);
router.post('/login/verify', verifyLoginOtp);
router.post('/signup', signup);
router.post('/signup/verify', verifySignupOtp);

export default router;

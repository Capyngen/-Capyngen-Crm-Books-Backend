"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptInviteSignup = exports.checkInviteStatus = exports.verifySignupOtp = exports.signup = exports.verifyLoginOtp = exports.login = void 0;
const UserOrganization_1 = require("../models/UserOrganization");
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const login = async (req, res) => {
    try {
        let { emailOrMobile, password, useOtp } = req.body;
        if (emailOrMobile)
            emailOrMobile = emailOrMobile.toLowerCase();
        const user = await User_1.User.findOne({
            $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }]
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (useOtp) {
            // Simulate OTP sending
            return res.json({ message: 'OTP sent', method: 'otp' });
        }
        if (!user.password || !password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid password' });
        res.json({ message: 'Login successful', user });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const verifyLoginOtp = async (req, res) => {
    try {
        const { emailOrMobile, otp } = req.body;
        if (otp !== '123456')
            return res.status(400).json({ message: 'Invalid OTP' });
        const user = await User_1.User.findOne({
            $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }]
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Login successful', user });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.verifyLoginOtp = verifyLoginOtp;
const signup = async (req, res) => {
    try {
        const { role, companyName, email, mobile, password, country, state } = req.body;
        let user = await User_1.User.findOne({ email });
        if (!user) {
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            user = new User_1.User({
                email,
                mobile,
                password: hashedPassword,
                role,
                companyName,
                country,
                state
            });
            await user.save();
        }
        res.json({ message: 'OTP sent for signup', user, signupData: { companyName, country, state } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.signup = signup;
const verifySignupOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (otp !== '1234567')
            return res.status(400).json({ message: 'Invalid OTP' });
        const user = await User_1.User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        if (user) {
            // Find any pending invites by email and link the new userId
            await UserOrganization_1.UserOrganization.updateMany({ email: user.email, status: 'Invited' }, { userId: user._id, status: 'Active' });
        }
        res.json({ message: 'Verification successful', user });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.verifySignupOtp = verifySignupOtp;
const checkInviteStatus = async (req, res) => {
    try {
        let { email } = req.body;
        email = email.toLowerCase();
        // Check if the user already exists and is fully registered
        const user = await User_1.User.findOne({ email });
        const isFullyRegistered = !!user;
        // Check if there's any pending invite for this email
        const pendingInvite = await UserOrganization_1.UserOrganization.findOne({ email, status: 'Invited' });
        if (isFullyRegistered) {
            // They already have an account, just ask for their existing password
            return res.json({ state: 'existing_user' });
        }
        else if (pendingInvite) {
            // They don't have a password but have an invite
            return res.json({ state: 'invited_user', orgId: pendingInvite.orgId });
        }
        else {
            // Neither registered nor invited
            return res.status(404).json({ state: 'not_found', message: 'Account not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.checkInviteStatus = checkInviteStatus;
const acceptInviteSignup = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (email)
            email = email.toLowerCase();
        // Ensure they actually have a pending invite
        const pendingInvites = await UserOrganization_1.UserOrganization.find({ email, status: 'Invited' });
        if (pendingInvites.length === 0) {
            return res.status(400).json({ message: 'No pending invites found' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        let user = await User_1.User.findOne({ email });
        if (!user) {
            // Pick name from the first invite if possible
            const name = pendingInvites[0].name || email.split('@')[0];
            user = new User_1.User({ email, password: hashedPassword, role: 'User', companyName: 'Invited' });
            await user.save();
        }
        else {
            user.password = hashedPassword;
            await user.save();
        }
        // We do NOT activate the invite here. Activation happens on the "Join Organization" page!
        // Just link the userId so they can login.
        await UserOrganization_1.UserOrganization.updateMany({ email, status: 'Invited' }, { userId: user._id });
        res.json({ message: 'Password set successfully. You can now login.', user });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.acceptInviteSignup = acceptInviteSignup;

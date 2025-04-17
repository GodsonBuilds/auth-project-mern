const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/confirm-otp', authController.confirmOtp);
router.post('/reset-password', authController.resetPassword);
router.get('/logout', authController.logout);

module.exports = router;

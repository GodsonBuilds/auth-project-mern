const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/verify-email', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/confirm-otp', authController.confirmOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);


module.exports = router;

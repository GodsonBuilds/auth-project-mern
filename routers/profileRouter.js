const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const profileController= require('../controllers/profileController');
const parser = require("../middlewares/upload");

router.get('/user-info', protect, profileController.userInfo);
router.post('/update-profile', protect, profileController.updateProfile);
router.post('/update-password', protect, profileController.updatePassword);
router.patch("/update-avatar", protect, parser.single("avatar"), profileController.updateAvatar);
module.exports = router; 
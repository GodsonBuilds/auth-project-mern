const express = require("express");
const router = express.Router();
const { isAuth } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/authRole");
const {
  getPendingPosts,
  approvePost,
  rejectPost,
  getDashboardStats
} = require("../controllers/adminController");

router.get("/posts", isAuth, checkRole("admin"), getPendingPosts);
router.patch("/posts/:id/approve", isAuth, checkRole("admin"), approvePost);
router.patch("/posts/:id/reject", isAuth, checkRole("admin"), rejectPost);

// Statistiques
router.get("/dashboard/stats", isAuth, checkRole("admin"), getDashboardStats);

module.exports = router;

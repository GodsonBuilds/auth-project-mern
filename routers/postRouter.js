const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const protect = require("../middlewares/auth");
const uploadPostImage = require("../middlewares/cloudinaryPostUpload");

router.post("/add", protect,uploadPostImage.array("images", 5), postController.createPost);
router.get("/lists", protect, postController.getAllPosts);
router.put("/update-post/:id", protect, uploadPostImage.array("images", 5), postController.updatePost);
router.delete("/delete-post/:id", protect, uploadPostImage.array("images", 5), postController.deletePost);
router.get("/:id/show", protect, postController.getPostDetails);
module.exports = router;

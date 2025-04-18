const Post = require("../models/PostModel");
const User = require("../models/userModels");

exports.getPendingPosts = async (req, res) => {
  const posts = await Post.find({ status: "pending" }).populate("author", "name email");
  res.json(posts);
};

exports.approvePost = async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
  res.json({ message: "Post approuvé", post });
};

exports.rejectPost = async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
  res.json({ message: "Post rejeté", post });
};

exports.getDashboardStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalPosts = await Post.countDocuments({ status: "approved" });

  const topAuthors = await Post.aggregate([
    { $match: { status: "approved" } },
    { $group: { _id: "$author", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "author"
      }
    },
    {
      $project: {
        count: 1,
        author: { $arrayElemAt: ["$author", 0] }
      }
    }
  ]);

  res.json({ totalUsers, totalPosts, topAuthors });
};

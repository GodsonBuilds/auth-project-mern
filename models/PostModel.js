const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Le contenu est requis"],
    },

    images: [ // Un post peut avoir plusieurs images
      {
        url: { type: String },
        public_id: { type: String }
      }
    ],
    
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Référence à la collection User
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Référence au modèle User
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Utilisateurs qui ont aimé le post
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);

// Explication :
// title & content → Contenu du post.

// author → Référence à l'utilisateur qui a créé le post (User).

// images → Liste d’URL d’images.

// likes → Tableau des utilisateurs ayant aimé le post.

// comments → Chaque commentaire a un auteur (user), un text, et une date (createdAt).

// timestamps: true → Ajoute automatiquement createdAt et updatedAt.

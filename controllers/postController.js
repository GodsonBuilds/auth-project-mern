const { createPostSchema } = require("../validators/createPostSchema");
const { updatePostSchema } = require("../validators/updatePostSchema");
const Post = require('../models/PostModel')
const User = require('../models/userModels')
const cloudinary = require("../utils/cloudinary");

exports.createPost = async (req, res) => {
  try {
    // Joi validation
      const { error, value } = createPostSchema.validate(req.body, { abortEarly: false });

      if (error) {
          // Supprimer l'image uploadée si validation échouée
      if (req.file && req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      } 
        const messages = error.details.map((err) => err.message);
        return res.status(400).json({ message: 'Validation échouée', errors: messages });
      } 
    
    const { title, content } = value;

    const imageUrl = req.file?.path || "";
    const publicId = req.file?.filename || "";

    const newPost = new Post({
      title,
      content,
     image: imageUrl,
     publicId,
      author: req.user._id,
    });

    const savedPost = await newPost.save();

    const populatedPost = await Post.findById(savedPost._id).populate(
      "author",
      "name email avatar"
    );

    res.status(201).json({
      success: true,
      message: "Post créé avec succès",
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du post",
    });
  }
};

// GET all posts
exports.getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      search = "",
      dateFrom = "",
      dateTo = ""
    } = req.query;

    const pageInt = parseInt(page);
    const perPageInt = parseInt(perPage);

    const searchFilter = {};

    // Recherche par titre ou nom d’auteur
    if (search) {
      const matchingUsers = await User.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

    const matchingUserIds = matchingUsers.map(user => user._id);

      searchFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $in: matchingUserIds } }
      ];
    }

    // Filtrer par date de création
    if (dateFrom || dateTo) {
      searchFilter.createdAt = {};
      if (dateFrom) searchFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) searchFilter.createdAt.$lte = new Date(dateTo);
    }

    // Compter les documents correspondants
    const totalPosts = await Post.countDocuments(searchFilter);

    // Récupérer les posts avec pagination
    const posts = await Post.find(searchFilter)
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((pageInt - 1) * perPageInt)
      .limit(perPageInt);

    const totalPages = Math.ceil(totalPosts / perPageInt);

    res.status(200).json({
      success: true,
      data: posts,
      meta: {
        total: totalPosts,
        perPage: perPageInt,
        currentPage: pageInt,
        lastPage: totalPages,
        firstPage: 1,
        hasNextPage: pageInt < totalPages,
        hasPrevPage: pageInt > 1,
      }
    });
  } catch (error) {
    console.error("Erreur pagination/recherche:", error.message);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des posts"
    });
  }
};

//Update post

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Valider l'entrée
    const { error, value } = updatePostSchema.validate(req.body, { abortEarly: false });
    if (error) {
        // Supprimer l'image uploadée si validation échouée
  if (req.file && req.file.filename) {
    await cloudinary.uploader.destroy(req.file.filename);
  }
      const messages = error.details.map(err => err.message);
      return res.status(400).json({ message: "Validation échouée", errors: messages });
    }

    // 2. Vérifier que le post existe
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post non trouvé" });

    // 3. Vérifier que le user est l’auteur
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Non autorisé à modifier ce post" });
    }

    // 4. Mise à jour
    post.title = value.title || post.title;
    post.content = value.content || post.content;

    if (post.postPublicId) {
           await cloudinary.uploader.destroy(post.postPublicId);
     }

     post.image = req.file.path;
     post.postPublicId = req.file.filename;


    const updated = await post.save();

    const populated = await Post.findById(updated._id).populate("author", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Post mis à jour avec succès",
      post: populated,
    });

  } catch (error) {
    console.error("Erreur updatePost:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du post" });
  }
};

//Delete Post
exports.deletePost = async (req, res) => {
    try {
      const { id } = req.params;
  
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: "Post non trouvé" });

      // Autorisation
      if (post.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Non autorisé à supprimer ce post" });
      }
  
      // Supprimer image sur Cloudinary si elle existe
      if (post.postPublicId) {
        await cloudinary.uploader.destroy(post.postPublicId);
      }
  
      // Supprimer le post de la base de données
      await post.deleteOne();
  
      res.status(200).json({ success: true, message: "Post supprimé avec succès" });
  
    } catch (error) {
      console.error("Erreur deletePost:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du post" });
    }
  };

  //Show

  exports.getPostDetails = async (req, res) => {
    try {
      const { id } = req.params;
  
      const post = await Post.findById(id).populate("author", "name email avatar");
  
      if (!post) {
        return res.status(404).json({ message: "Post non trouvé" });
      }
  
      res.status(200).json({
        success: true,
        post,
      });
  
    } catch (error) {
      console.error("Erreur getPostDetails:", error.message);
      res.status(500).json({ message: "Erreur lors de la récupération du post" });
    }
  };
  

  
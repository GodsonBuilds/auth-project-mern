const User = require('../models/userModels');
const { updateProfileSchema, updatePasswordSchema } = require('../validators/profiles');
const cloudinary = require("../utils/cloudinary");

exports.userInfo= async (req, res) => {
    try {
      // Récupère l'utilisateur avec l'ID du token
      const user = await User.findById(req.user.id).select('-password'); // On exclut le mot de passe
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }
  
      res.status(200).json({
        message: 'Informations de l\'utilisateur récupérées avec succès.',
        data: user
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  };
  
exports.updateProfile = async (req, res) => {

    const { error, value } = updateProfileSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const messages = error.details.map(err => err.message);
        return res.status(400).json({ message: 'Validation échouée', errors: messages });
      }
    const { name, email, numero } = value;
  
    try {
      // Vérifie que l'utilisateur existe
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }
  
      // Met à jour les champs du profil
      if (name !== undefined) user.name = value.name;
      if (email !== undefined) user.email = value.email;
      if (numero !== undefined) user.numero = value.numero; // autorise aussi vide ("")
  
      // Sauvegarde les modifications
      await user.save();
  
      res.status(200).json({
        message: 'Profil mis à jour avec succès.',
        data: user
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  };

exports.updatePassword = async (req, res) => {

      const { error, value } = updatePasswordSchema.validate(req.body, { abortEarly: false });
      
        if (error) {
          const messages = error.details.map(err => err.message);
          return res.status(400).json({ message: 'Validation échouée', errors: messages });
        }
      
    const { oldPassword, newPassword, newPasswordConfirm } = value;
  
    // Validation des mots de passe
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
    }
  
    try {
      // Vérifie que l'utilisateur existe
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }
  
      // Vérifie l'ancien mot de passe
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'L\'ancien mot de passe est incorrect.' });
      }
  
      user.password = newPassword;
  
      // Sauvegarde les modifications
      await user.save();
  
      res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  };

  exports.updateAvatar = async (req, res) => {
    try {
      const userId = req.user.id;
  
      if (!req.file || !req.file.path) {
        return res.status(400).json({ message: "Aucune image envoyée." });
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }
  
      // Supprimer l'ancienne image si elle existe dans Cloudinary
      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      }

      // Mettre à jour l'avatar
      user.avatar = req.file.path;
      user.avatarPublicId = req.file.filename;
  
      await user.save();

      const cleanUser = user.toObject();
      delete cleanUser.avatarPublicId;

      res.status(200).json({
        message: "Image de profil mise à jour.",
        data: cleanUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de l'upload", error });
    }
  };
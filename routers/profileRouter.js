const express = require('express');
const router = express.Router();
const User = require('../models/userModels');
const protect = require('../middlewares/auth');
const { updateProfileSchema, updatePasswordSchema } = require('../validators/profiles');

// Route pour récupérer les informations de l'utilisateur
router.get('/user-info', protect, async (req, res) => {
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
  });
  
  // Route pour mettre à jour le profil de l'utilisateur
router.put('/update-profile',protect, async (req, res) => {

    const { error, value } = updateProfileSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const messages = error.details.map(err => err.message);
        return res.status(400).json({ message: 'Validation échouée', errors: messages });
      }
    const { name, email } = value;
  
    try {
      // Vérifie que l'utilisateur existe
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }
  
      // Met à jour les champs du profil
      if (value.name !== undefined) user.name = value.name;
      if (value.email !== undefined) user.email = value.email;
      if (value.numero !== undefined) user.numero = value.numero; // autorise aussi vide ("")
  
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
  });

  // Route pour mettre à jour le mot de passe
router.put('/update-password',protect,  async (req, res) => {

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
  });
  
module.exports = router;
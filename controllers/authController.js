const User = require('../models/userModels');
const bcrypt = require("bcryptjs");
const sendForgotPasswordCode = require("../utils/sendForgotPasswordCode");
const { resetPasswordSchema } = require('../validators/auth');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Aucun compte associé à cet email." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.forgotPasswordCode = otp;
    user.forgotPasswordCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendForgotPasswordCode(user.email, otp);

    res.status(200).json({ message: "Code envoyé par email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.confirmOtp = async (req, res) => {
    const { email, code } = req.body;
  
    try {
      // Vérifie que l'email et le code sont fournis
      if (!email || !code) {
        return res.status(400).json({ message: "Email et code requis." });
      }
  
      // Recherche l'utilisateur avec les champs nécessaires
      const user = await User.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeExpires');
      if (!user) {
        return res.status(404).json({ message: "Utilisateur introuvable." });
      }
  
      // Vérifie si le code correspond
      if (user.forgotPasswordCode !== code) {
        return res.status(400).json({ message: "Code incorrect." });
      }
  
      // Vérifie si le code est expiré
      if (user.forgotPasswordCodeExpires < new Date()) {
        return res.status(400).json({ message: "Code expiré. Veuillez en demander un nouveau." });
      }

  // Marquer l’utilisateur comme ayant confirmé l’OTP
    user.otpConfirmed = true;
      // (Facultatif) On peut invalider le code ici directement après validation, si tu veux
      user.forgotPasswordCode = undefined;
      user.forgotPasswordCodeExpires = undefined;
      await user.save();
  
      res.status(200).json({ message: "Code vérifié. Vous pouvez réinitialiser votre mot de passe.",
        otpConfirmed: true
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur." });
    }
  };

  nexports.resetPassword = async (req, res) => {
      
      // 1. Validation des données
      const { error, value } = resetPasswordSchema.validate(req.body, { abortEarly: false });
      
      if (error) {
          const messages = error.details.map((err) => err.message);
          return res.status(400).json({ message: 'Validation échouée', errors: messages });
        }
        const { email, password} = value;

    try {
      // 2. Vérification de l'utilisateur
      const user = await User.findOne({ email }).select('+otpConfirmed');
      if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
  
      // Vérifie que l'utilisateur a bien confirmé l’OTP
    if (!user.otpConfirmed) {
        return res.status(400).json({ message: "Veuillez d'abord confirmer le code reçu par email." });
      }

      user.password = password;

    // Réinitialisation terminée → réinitialiser le flag
    user.otpConfirmed = false;
      // 6. Sauvegarder
      await user.save(); // Sauvegarde avec hachage automatique par Mongoose
  
      res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur." });
    }
  };
  


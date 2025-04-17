const User = require('../models/userModels');
const sendForgotPasswordCode = require("../utils/sendForgotPasswordCode");
const { registerSchema, loginSchema, resetPasswordSchema } = require('../validators/auth');
const { v4: uuidv4 } = require("uuid");  
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const generateToken = require('../utils/jwt');

exports.login= async (req, res) => {
  // Validation avec Joi
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map(err => err.message);
    return res.status(400).json({ message: 'Validation échouée', errors: messages });
  }

  const { email, password } = value;

  try {
    const user = await User.findOne({ email }).select('+password +verified');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }
    
     // Vérifier si l'email a été confirmé
  if (!user.verified) {
      return res.status(403).json({ message: 'Veuillez vérifier votre adresse email avant de vous connecter.' });
    } 


    const token = generateToken(user._id);
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const { password: pwd, ...userWithoutPassword } = user.toObject();

    res.json({
      message: 'Connexion réussie',
      data: {
          token,
          expiresAt,  
          user: userWithoutPassword,
        },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.register = async (req, res) => {
  // Joi valide les données entrantes
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((err) => err.message);
    return res.status(400).json({ message: 'Validation échouée', errors: messages });
  }

  const { name, email, numero, password } = value;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    // Génération du token UUID pour la vérification par email
    const verificationCode = uuidv4();
    const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000);  // Expire après 24h


    const newUser = new User({ name, email, numero, password,
       verificationCode,  
      verificationCodeValidation: expiresDate
   });
      await newUser.save();
      
      // Envoi de l'email de vérification
    await sendVerificationEmail(email, verificationCode, newUser._id);

    const { password: pwd, ...userWithoutPassword } = newUser.toObject();
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: 'Inscription réussie. Un email de vérification a été envoyé.',
      user: userWithoutPassword,
      token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.logout= (req, res) => {
  // Ici, côté serveur, tu n'as rien à faire, la déconnexion est client-side
  res.json({ message: 'Déconnexion réussie' });
};

exports.verifyEmail =  async (req, res) => {
  const { token, id } = req.query;

  try {
    const user = await User.findById(id).select("+verificationCode +verificationCodeValidation");

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    if (user.verified) return res.json({ message: "Compte déjà vérifié" });

    if (user.verificationCode !== token) {
      return res.status(400).json({ message: "Token invalide" });
    }

    if (new Date() > user.verificationCodeValidation) {
      return res.status(400).json({ message: "Token expiré" });
    }

    // Marquer l'utilisateur comme vérifié
    user.verified = true;
    user.verificationCode = undefined;
    user.verificationCodeValidation = undefined;
    await user.save();

    res.json({ message: "Email vérifié avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

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

  exports.resetPassword = async (req, res) => {
      
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

  exports.resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email }).select('+verified');
  
      if (!user) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }
  
      if (user.verified) {
        return res.status(400).json({ message: "Ce compte est déjà vérifié." });
      }
  
      // Nouveau token + nouvelle expiration
      const verificationCode = uuidv4();
      const expiresDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
      user.verificationCode = verificationCode;
      user.verificationCodeValidation = expiresDate;
      await user.save();
  
      await sendVerificationEmail(user.email, verificationCode, user._id);
  
      res.json({ message: "Un nouvel email de vérification a été envoyé." });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  
  


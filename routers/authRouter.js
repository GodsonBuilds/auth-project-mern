const express = require('express');
const router = express.Router();
const User = require('../models/userModels');
const generateToken = require('../utils/jwt');
const { registerSchema, loginSchema  } = require('../validators/auth');
const { v4: uuidv4 } = require("uuid");  
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const authController = require('../controllers/authController');


  
  router.post('/login', async (req, res) => {
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
  });

  router.post('/register', async (req, res) => {
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
  });

  router.post('/logout', (req, res) => {
    // Ici, côté serveur, tu n'as rien à faire, la déconnexion est client-side
    res.json({ message: 'Déconnexion réussie' });
  });

  router.get("/verify-email", async (req, res) => {
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
  });
  
  router.post('/forgot-password', authController.forgotPassword);
router.post('/confirm-otp', authController.confirmOtp);
router.post('/reset-password', authController.resetPassword);



module.exports = router;

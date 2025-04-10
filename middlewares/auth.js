const jwt = require('jsonwebtoken');
const User = require('../models/userModels');

const protect = async (req, res, next) => {
  let token;

  // Vérification de la présence du token dans l'en-tête Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extraction du token depuis l'en-tête Authorization
      token = req.headers.authorization.split(' ')[1];

      // Vérification du token avec jwt.verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Si le token est valide, récupérer l'utilisateur et l'attacher à la requête
      req.user = await User.findById(decoded.id).select('-password');
      next();  // Appel de next() pour permettre l'accès à la route protégée
    } catch (error) {
      // Si le token est expiré ou invalide, retourner une erreur
      return res.status(401).json({ message: 'Token expiré ou invalide' });
    }
  }

  if (!token) {
    // Si aucun token n'est trouvé, renvoyer une erreur d'accès non autorisé
    return res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

module.exports = protect;

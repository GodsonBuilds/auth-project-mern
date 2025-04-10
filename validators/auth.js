const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Le nom est requis',
    'string.min': 'Le nom doit avoir au moins 2 caractères',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'string.empty': 'L\'email est requis',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Le mot de passe doit avoir au moins 6 caractères',
    'string.empty': 'Le mot de passe est requis',
  }),
  passwordConfirm: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Les mots de passe ne correspondent pas',
    'string.empty': 'La confirmation du mot de passe est requise',
  }),
});

// Schéma pour la connexion
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email invalide',
      'string.empty': 'L\'email est requis',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Le mot de passe est requis',
    }),
  });

  const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Le mot de passe doit avoir au moins 6 caractères',
      'string.empty': 'Le mot de passe est requis',
    }),
    passwordConfirm: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Les mots de passe ne correspondent pas',
      'string.empty': 'La confirmation du mot de passe est requise',
    }),
  });

module.exports = { registerSchema, loginSchema, resetPasswordSchema };

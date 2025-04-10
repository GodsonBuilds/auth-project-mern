const Joi = require('joi');

const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    numero: Joi.string().allow(''),
  }).or('name', 'email', 'numero'); //  au moins un requis
  
  const updatePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
      'string.empty': 'L\'ancien mot de passe est requis.'
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.empty': 'Le nouveau mot de passe est requis.',
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères.'
    }),
    newPasswordConfirm: Joi.any().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Les mots de passe ne correspondent pas.',
      'any.required': 'La confirmation du mot de passe est requise.'
    }),
  });

  module.exports = {updateProfileSchema, updatePasswordSchema };
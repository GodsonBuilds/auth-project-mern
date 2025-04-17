const Joi = require('joi');

const createPostSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Le titre est requis",
      "string.min": "Le titre doit contenir au moins 3 caractères",
      "string.max": "Le titre ne peut pas dépasser 100 caractères"
    }),

  content: Joi.string()
    .min(10)
    .required()
    .messages({
      "string.empty": "Le contenu est requis",
      "string.min": "Le contenu doit contenir au moins 10 caractères"
    })
});

module.exports = { createPostSchema };

const Joi = require('joi');

const updatePostSchema = Joi.object({
  title: Joi.string().min(3),
  content: Joi.string().min(5),
});

module.exports = { updatePostSchema };

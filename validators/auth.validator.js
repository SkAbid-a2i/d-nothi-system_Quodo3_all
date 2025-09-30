const Joi = require('joi');

// Login validation
const loginValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

module.exports = {
  loginValidation,
};
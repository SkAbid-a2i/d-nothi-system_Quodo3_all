const Joi = require('joi');

// User validation
const userValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('SystemAdmin', 'Admin', 'Supervisor', 'Agent').required(),
    office: Joi.string().optional().allow(''),
  });

  return schema.validate(data);
};

module.exports = {
  userValidation,
};
const Joi = require('joi');

// User validation for creation
const userValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('SystemAdmin', 'Admin', 'Supervisor', 'Agent').required(),
    office: Joi.string().optional().allow(''),
    bloodGroup: Joi.string().optional().allow('').max(10),
    phoneNumber: Joi.string().optional().allow('').max(20),
    bio: Joi.string().optional().allow('').max(500),
    designation: Joi.string().optional().allow('').max(255)
  });

  return schema.validate(data);
};

// User validation for updates (all fields optional)
const userUpdateValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    fullName: Joi.string().min(2).max(50).optional(),
    role: Joi.string().valid('SystemAdmin', 'Admin', 'Supervisor', 'Agent').optional(),
    office: Joi.string().optional().allow(''),
    bloodGroup: Joi.string().optional().allow('').max(10),
    phoneNumber: Joi.string().optional().allow('').max(20),
    bio: Joi.string().optional().allow('').max(500),
    designation: Joi.string().optional().allow('').max(255),
    isActive: Joi.boolean().optional()
  });

  return schema.validate(data);
};

module.exports = {
  userValidation,
  userUpdateValidation,
};
const joi = require('@hapi/joi');

const registerValidation = (data) => {
  const schema = joi.object({
    name: joi.string().min(10).required(),
    email: joi.string().required().email(),
    password: joi.string().min(8).required(),
    confirmPassword: joi.string().min(8).required(),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = joi.object({
    email: joi.string().required().email(),
    password: joi.string().min(8).required(),
  });
  return schema.validate(data);
};

const classRegisterValidation = (data) => {
  const schema = joi.object({
    subject: joi.string().required(),
    teacherID: joi.string().required(),
    password: joi.string().min(8).required(),
    confirmPassword: joi.string().min(8).required(),
  });
  return schema.validate(data);
};
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.classRegisterValidation = classRegisterValidation;

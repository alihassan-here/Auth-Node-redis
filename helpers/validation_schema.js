const joi = require('@hapi/joi');

const authSchema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(6).required()
});

module.exports = {
    authSchema
};
//VALIDATION
const Joi = require('@hapi/joi');


// Signup VALIDATION
const signupValidation = (data) =>{
    const schema = Joi.object({
        first_name: Joi.string().min(2).required(),
        last_name: Joi.string().min(2).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(2).required(),
        state: Joi.string().min(2).required()
    });

    return schema.validate(data);
}

const loginValidation = (data) =>{
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(2).required(),
    });

    return schema.validate(data);
}


const parcelValidation = (data) =>{
    const schema = Joi.object({
        price: Joi.number().min(2).required(),
        weight: Joi.number().min(2).required(),
        location: Joi.string().min(2).required(),
        destination: Joi.string().min(2).required(),
        sender_name: Joi.string().min(2).required(),
        sender_note: Joi.string().min(2).required()
    });

    return schema.validate(data);
}




module.exports.signupValidation = signupValidation;
module.exports.loginValidation = loginValidation;
module.exports.parcelValidation = parcelValidation;

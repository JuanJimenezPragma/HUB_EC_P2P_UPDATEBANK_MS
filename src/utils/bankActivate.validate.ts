import Joi from 'joi';

const BankSchema = Joi.object({
    isActive: Joi.boolean().required().messages({
        'any.required': '"isActive" es un campo obligatorio.',
        'boolean.base': '"isActive" debe ser un valor booleano (true o false).',
    }),
}).options({ allowUnknown: false })
  .messages({
    'object.unknown': 'El campo {#label} no está permitido cuando la solicitud es de estado unicamente.',
  });

export const ValidateBankActivation = (data: any) => {
    return BankSchema.validate(data, { abortEarly: false });
};

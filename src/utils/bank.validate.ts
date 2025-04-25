import Joi, { CustomHelpers } from 'joi';
import Decimal from 'decimal.js';


const decimalValidation = (value:any, helpers:CustomHelpers, fieldName:string) => {
    try {
        new Decimal(value); 
    } catch {
        return helpers.error('any.invalid', { message: `"${fieldName}" debe ser un número válido` });
    }
    return value;
};

const BankSchema = Joi.object({
    logo: Joi.string().min(3).messages({
        'string.min': '"logo" debe contener al menos 3 caracteres.',
    }),
    isActive: Joi.boolean().messages({
        'boolean.base': '"isActive" debe ser un valor booleano.',
    }),
    entityName: Joi.string().required().min(3).messages({
        'string.min': 'El nombre de la entidad debe contener al menos 3 caracteres.',
        'any.required': 'El nombre de la entidad es un campo obligatorio.',
    }),
    recipients: Joi.array()
        .required()
        .items(Joi.string().email().messages({
            'string.email': 'Cada destinatario en los emails debe ser un correo electrónico válido.',
        }))
        .max(15)
        .unique()
        .messages({
            'array.max': 'Los emails no puede contener más de 15 correos electrónicos únicos.',
            'array.unique': 'Todos los correos deben ser únicos.',
            'any.required': 'Los emails es un campo obligatorio.',
        }),
    initial_amount: Joi.string().required().custom((value, helpers) => decimalValidation(value, helpers, 'initial_amount')).messages({
        'any.invalid': 'Monto inicial debe ser un número válido.',
        'any.required': 'Monto inicial es un campo obligatorio.',
    }),
    lowerLimit: Joi.string().required().custom((value, helpers) => decimalValidation(value, helpers, 'lowerLimit')).messages({
        'any.invalid': 'Limite inferior debe ser un número válido.',
        'any.required': 'Limite inferior es un campo obligatorio.',
    }),
    upperLimit: Joi.string().required().custom((value, helpers) => decimalValidation(value, helpers, 'upperLimit')).messages({
        'any.invalid': 'Limite superior debe ser un número válido.',
        'any.required': 'Limite superior es un campo obligatorio.',
    }),
    denialLimit: Joi.string().required().custom((value, helpers) => decimalValidation(value, helpers, 'denialLimit')).messages({
        'any.invalid': 'Limite de negacion debe ser un número válido.',
        'any.required': 'Limite de negacion es un campo obligatorio.',
    }),
})
    .with('upperLimit', 'initial_amount')
    .with('upperLimit', 'denialLimit')
    .with('upperLimit', 'lowerLimit')
    .with('initial_amount', 'lowerLimit')
    .with('lowerLimit', 'denialLimit')
    .custom((value, helpers) => {
        const { upperLimit, initial_amount, lowerLimit, denialLimit } = value;

        try {
            const upperLimitDecimal = new Decimal(upperLimit);
            const initialAmountDecimal = new Decimal(initial_amount);
            const lowerLimitDecimal = new Decimal(lowerLimit);
            const denialLimitDecimal = new Decimal(denialLimit);

            if (
                !(
                    upperLimitDecimal.gt(initialAmountDecimal) &&
                    upperLimitDecimal.gt(denialLimitDecimal) &&
                    upperLimitDecimal.gt(lowerLimitDecimal) &&
                    initialAmountDecimal.gt(denialLimitDecimal) &&
                    initialAmountDecimal.gt(lowerLimitDecimal) &&
                    lowerLimitDecimal.gt(denialLimitDecimal)
                )
            ) {
                return helpers.message({
                    custom: 'Los límites deben cumplir: upperLimit > initial_amount > lowerLimit > denialLimit',
                });
            }
        } catch {
            return helpers.error('any.custom', {
                message: 'Error al comparar los límites. Verifique que los valores sean números válidos.',
            });
        }

        return value;
    });

export const ValidateBank = (data: any) => {
    return BankSchema.validate(data, { abortEarly: false });
};

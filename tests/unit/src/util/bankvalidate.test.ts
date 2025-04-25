import { ValidateBank } from './../../../../src/utils/bank.validate';

describe('BankSchema Validation', () => {
    test('should validate correctly with valid data', () => {
        const validData = {
            logo: 'https://logo.com',
            isActive: true,
            entityName: 'Bank Entity',
            recipients: ['test@example.com'],
            initial_amount: '100.00',
            lowerLimit: '50.00',
            upperLimit: '200.00',
            denialLimit: '10.00'
        };
        
        const { error } = ValidateBank(validData);
        expect(error).toBeUndefined();
    });

    test('should fail if initial_amount is not a valid decimal', () => {
        const invalidData = {
            logo: 'https://logo.com',
            isActive: true,
            entityName: 'Bank Entity',
            recipients: ['test@example.com'],
            initial_amount: 'abc',
            lowerLimit: '50.00',
            upperLimit: '200.00',
            denialLimit: '10.00'
        };
        
        const { error } = ValidateBank(invalidData);
        expect(error?.details[0].message).toContain('Monto inicial debe ser un número válido.');
    });

    test('should fail if lowerLimit is not a valid decimal', () => {
        const invalidData = {
            logo: 'https://logo.com',
            isActive: true,
            entityName: 'Bank Entity',
            recipients: ['test@example.com'],
            initial_amount: '100.00',
            lowerLimit: 'xyz',
            upperLimit: '200.00',
            denialLimit: '10.00'
        };

        const { error } = ValidateBank(invalidData);
        expect(error?.details[0].message).toContain('Limite inferior debe ser un número válido.');
    });

    test('should fail if upperLimit is not a valid decimal', () => {
        const invalidData = {
            logo: 'https://logo.com',
            isActive: true,
            entityName: 'Bank Entity',
            recipients: ['test@example.com'],
            initial_amount: '100.00',
            lowerLimit: '50.00',
            upperLimit: 'abc',
            denialLimit: '10.00'
        };

        const { error } = ValidateBank(invalidData);
        expect(error?.details[0].message).toContain('Limite superior debe ser un número válido.');
    });

    test('should fail if denialLimit is not a valid decimal', () => {
        const invalidData = {
            logo: 'https://logo.com',
            isActive: true,
            entityName: 'Bank Entity',
            recipients: ['test@example.com'],
            initial_amount: '100.00',
            lowerLimit: '50.00',
            upperLimit: '200.00',
            denialLimit: 'abc'
        };

        const { error } = ValidateBank(invalidData);
        expect(error?.details[0].message).toContain('Limite de negacion debe ser un número válido.');
    });

    test('should fail if limits do not meet the hierarchy condition', () => {
        const invalidData = {
            logo: 'https://logo.com',
            isActive: true,
            entityName: 'Bank Entity',
            recipients: ['test@example.com'],
            initial_amount: '100.00',
            lowerLimit: '120.00',
            upperLimit: '200.00',
            denialLimit: '10.00'
        };

        const { error } = ValidateBank(invalidData);
        expect(error?.details[0].message).toContain('Los límites deben cumplir: upperLimit > initial_amount > lowerLimit > denialLimit');
    });

    test('should fail if entityName is too short', () => {
        const invalidData = {
            logo: 'https://logo.com',
            isActive: true,
            entityName: 'AB',
            recipients: ['test@example.com'],
            initial_amount: '100.00',
            lowerLimit: '50.00',
            upperLimit: '200.00',
            denialLimit: '10.00'
        };

        const { error } = ValidateBank(invalidData);
        expect(error?.details[0].message).toContain('El nombre de la entidad debe contener al menos 3 caracteres.');
    });

    test('should fail if recipients contains duplicate emails', () => {
        const invalidData = {
            logo: 'https://logo.com',
            isActive: true,
            entityName: 'Bank Entity',
            recipients: ['test@example.com', 'test@example.com'],
            initial_amount: '100.00',
            lowerLimit: '50.00',
            upperLimit: '200.00',
            denialLimit: '10.00'
        };

        const { error } = ValidateBank(invalidData);
        expect(error?.details[0].message).toContain('Todos los correos deben ser únicos.');
    });

    test('should fail if recipients contains an invalid email', () => {
        const invalidData = {
            logo: 'https://logo.com',
            isActive: true,
            entityName: 'Bank Entity',
            recipients: ['invalid-email'],
            initial_amount: '100.00',
            lowerLimit: '50.00',
            upperLimit: '200.00',
            denialLimit: '10.00'
        };

        const { error } = ValidateBank(invalidData);
        expect(error?.details[0].message).toContain('Cada destinatario en los emails debe ser un correo electrónico válido.');
    });

    test('should fail if logo contains less than 3 characters', () => {
        const invalidData = {
            logo: 'om',
            isActive: true,
            entityName: 'Bank Entity',
            recipients: ['invalid-email'],
            initial_amount: '100.00',
            lowerLimit: '50.00',
            upperLimit: '200.00',
            denialLimit: '10.00'
        };

        const { error } = ValidateBank(invalidData);
        expect(error?.details[0].message).toContain('"logo" debe contener al menos 3 caracteres.');
    });
});

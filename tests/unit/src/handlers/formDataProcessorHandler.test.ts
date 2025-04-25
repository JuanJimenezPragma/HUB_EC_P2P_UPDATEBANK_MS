import { processFormDataHandler } from './../../../../src/handlers/formDataProcessorHandler';
import { APIGatewayProxyEvent } from 'aws-lambda';
import Busboy from 'busboy';

jest.mock('busboy');

describe('processFormDataHandler', () => {
    let mockEvent: APIGatewayProxyEvent;
    let mockBusboyInstance: any;

    beforeEach(() => {
        mockEvent = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: '',
            isBase64Encoded: true,
            httpMethod: 'POST',
            path: '/',
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            pathParameters: null,
            stageVariables: null,
            requestContext: {} as any,
            resource: '',
            multiValueHeaders: {},
        };

        mockBusboyInstance = {
            on: jest.fn(),
            end: jest.fn(),
        };
        (Busboy as jest.Mock).mockImplementation(() => mockBusboyInstance);
    });

    const mockBusboyFields = (fields: { [key: string]: any }) => {
        mockBusboyInstance.on.mockImplementation((event: 'field' | 'file' | 'finish', callback: Function) => {
            if (event === 'field') {
                for (const [key, value] of Object.entries(fields)) {
                    callback(key, value);
                }
            } else if (event === 'finish') {
                callback();
            }
        });
    };

    it('should reject if body is missing', async () => {
        mockEvent.body = null;
        await expect(processFormDataHandler(mockEvent)).rejects.toThrow('Los campos de la entidad son obligatorios.');
    });

    it('should process form fields and file data correctly', async () => {
        const fileBuffer = Buffer.from('mock file data');
        mockEvent.body = Buffer.from('mock file data').toString('base64');

        mockBusboyInstance.on.mockImplementation((event: 'file', callback: Function) => {
            if (event === 'file') {
                callback('file', { on: jest.fn((_, cb) => cb(fileBuffer)) }, 'filename.png', '', 'image/png');
            } else if (event === 'field') {
                callback('entityName', 'Test Bank');
                callback('isActive', 'true');
                callback('initial_amount', '1000');
            } else if (event === 'finish') {
                callback();
            }
        });

        const result = await processFormDataHandler(mockEvent);

        expect(result.formData).toEqual({
            entityName: 'Test Bank',
            isActive: true,
            initial_amount: '1000',
            logo: 'testbank.png',
        });
        expect(result.fileData).toEqual(fileBuffer);
    });

    it('should log warning for unknown field', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        mockEvent.body = Buffer.from('mock data').toString('base64');

        mockBusboyFields({
            unknownField: 'some value',
        });

        await processFormDataHandler(mockEvent);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown field: unknownField');
        consoleWarnSpy.mockRestore();
    });

    it('should handle error in processing data', async () => {
        mockEvent.body = Buffer.from('mock data').toString('base64');

        mockBusboyInstance.on.mockImplementation((event: 'finish', callback: Function) => {
            if (event === 'finish') {
                throw new Error('Processing error');
            }
        });

        await expect(processFormDataHandler(mockEvent)).rejects.toThrow('El cuerpo de la solicitud está vacio.');
    });

    it('should handle boolean field conversion for isActive', async () => {
        mockEvent.body = Buffer.from('mock data').toString('base64');

        mockBusboyFields({
            isActive: 'false',
        });

        const result = await processFormDataHandler(mockEvent);
        expect(result.formData).toEqual({
            isActive: false,
        });
    });

    it('should handle recipients field as array', async () => {
        mockEvent.body = Buffer.from('mock data').toString('base64');

        mockBusboyFields({
            recipients: 'email1@example.com,email2@example.com',
        });

        const result = await processFormDataHandler(mockEvent);
        expect(result.formData).toEqual({
            recipients: ['email1@example.com', 'email2@example.com'],
        });
    });

    it('should throw an error if a field value is invalid', async () => {
        mockEvent.body = Buffer.from('mock data').toString('base64');

        mockBusboyFields({
            denialLimit: 'invalid_number',
        });

        await expect(processFormDataHandler(mockEvent)).resolves.toStrictEqual({
            fileData: undefined,
            formData: { denialLimit: 'invalid_number' },
        });
    });
});

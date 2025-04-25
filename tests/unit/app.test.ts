import { CustomResponse } from './../../src/constants/customResponses';
import { CustomError } from './../../src/error/customError';
import { parametersBankHandler } from './../../src/handlers/parametersBankHandler';
import { lambdaHandler } from './../../app';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('./../../src/handlers/parametersBankHandler');

describe('lambdaHandler', () => {
    const mockEvent: APIGatewayProxyEvent = {
        headers: {},
        body: '',
        httpMethod: 'POST',
        isBase64Encoded: false,
        path: '',
        pathParameters: null,
        queryStringParameters: null,
        requestContext: {} as any,
        resource: '',
        stageVariables: null,
        multiValueHeaders: {},
        multiValueQueryStringParameters: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return success response if parametersBankHandler succeeds', async () => {
        const responseData = CustomResponse.S201000;
        (parametersBankHandler as jest.Mock).mockResolvedValue(responseData);
        const result = await lambdaHandler(mockEvent);

        expect(result.statusCode).toBe(201);
        expect(result.body).toContain(CustomResponse.S201000.message);
    });

    it('should handle missing origin header gracefully', async () => {
        (parametersBankHandler as jest.Mock).mockResolvedValue({});
        const result = await lambdaHandler(mockEvent);

        expect(result.headers?.['Access-Control-Allow-Origin']).toBe('');
    });

    it('should handle CustomError thrown by parametersBankHandler', async () => {
        const customError = new CustomError(CustomResponse.B400000);
        (parametersBankHandler as jest.Mock).mockRejectedValue(customError);

        const result = await lambdaHandler(mockEvent);

        expect(result.statusCode).toBe(400);
        expect(result.body).toContain(CustomResponse.B400000.message);
    });

    it('should handle non-CustomError thrown by parametersBankHandler as 500', async () => {
        (parametersBankHandler as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

        const result = await lambdaHandler(mockEvent);

        expect(result.statusCode).toBe(500);
        expect(result.body).toContain(CustomResponse.E500000.message);
    });

    it('should return expected response data on success', async () => {
        const responseData = {};
        (parametersBankHandler as jest.Mock).mockResolvedValue(responseData);

        const result = await lambdaHandler(mockEvent);

        expect(result.body).toContain(JSON.stringify(responseData));
    });

});

import { UpdateToS3Service } from './../../../../src/services/updateToS3Service';
import { ValidateBank } from './../../../../src/utils/bank.validate';
import { processFormDataHandler } from './../../../../src/handlers/formDataProcessorHandler';
import { updateBankService } from './../../../../src/services/updateBankService';
import { CustomResponse } from './../../../../src/constants/customResponses';
import { CustomError } from './../../../../src/error/customError';
import { parametersBankHandler } from './../../../../src/handlers/parametersBankHandler';
import { getParameter } from '../../../../src/utils/ssmClient'
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('../../../../src/utils/ssmClient', () => ({
    getParameter: jest.fn(),
}));

jest.mock('./../../../../src/handlers/formDataProcessorHandler', () => ({
    processFormDataHandler: jest.fn(),
}));

jest.mock('./../../../../src/services/updateBankService', () => ({
    updateBankService: jest.fn(),
}));

jest.mock('./../../../../src/services/updateToS3Service', () => ({
    UpdateToS3Service: jest.fn(),
}));

jest.mock('./../../../../src/utils/bank.validate', () => ({
    ValidateBank: jest.fn(),
}));

describe('parametersBankHandler', () => {
    let event: APIGatewayProxyEvent;

    beforeEach(() => {
        event = {
            pathParameters: { fiid: '1234' },
            body: JSON.stringify({}),
            headers: {Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Indha2F3YWthZWhlaEBzYW1pbmFtaW5hLmNvbSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.e3aEA8p7GXE2AjBoQSq_Of4BYbtiGJFpL4gKCQHZoL0'}
        } as unknown as APIGatewayProxyEvent;
        jest.clearAllMocks();
    });

    it('debería lanzar un error si faltan parámetros en el entorno', async () => {
        
        (getParameter as jest.Mock).mockReturnValue(undefined);

        await expect(parametersBankHandler(event)).rejects.toThrow(new CustomError(CustomResponse.E500001));

        process.env.ParametersBankTableName = 'TestTable'; 
    });

    it('debería lanzar un error si faltan parámetros en pathParameters', async () => {
        event.pathParameters = null; 

        await expect(parametersBankHandler(event)).rejects.toThrow(new CustomError(CustomResponse.E500001));
    });

    it('debería validar los datos y actualizar correctamente en S3 y DynamoDB', async () => {
        
        const formData = {logo:'testbank.png', entityName: 'TestBank' };
        const fileData = Buffer.from('file content');
        const validationResult = { value: formData, error: null };
        
        (getParameter as jest.Mock).mockResolvedValueOnce("TestTable");
        (getParameter as jest.Mock).mockResolvedValueOnce("TestBucket");
        (processFormDataHandler as jest.Mock).mockResolvedValueOnce({ formData, fileData });
        (ValidateBank as jest.Mock).mockReturnValueOnce(validationResult);
        (updateBankService as jest.Mock).mockResolvedValueOnce(undefined);
        (UpdateToS3Service as jest.Mock).mockResolvedValueOnce(undefined);

        const response = await parametersBankHandler(event);

        expect(processFormDataHandler).toHaveBeenCalledWith(event);
        expect(ValidateBank).toHaveBeenCalledWith(formData);
        expect(UpdateToS3Service).toHaveBeenCalledWith('images/testbank.png', 'TestBucket', fileData);
        expect(updateBankService).toHaveBeenCalledWith('TestTable', formData, '1234');
        expect(response).toBe(CustomResponse.S201000);
    });

    it('debería lanzar un error de validación si los datos del formulario no son válidos', async () => {
        
        const formData = { entityName: 'TestBank' };
        const fileData = Buffer.from('file content');
        const validationResult = { error: { details: [{ message: 'Solicitud Incorrecta.' }] } };

        
        (getParameter as jest.Mock).mockResolvedValueOnce("TestTable");
        (getParameter as jest.Mock).mockResolvedValueOnce("TestBucket");
        (processFormDataHandler as jest.Mock).mockResolvedValueOnce({ formData, fileData });
        (ValidateBank as jest.Mock).mockReturnValueOnce(validationResult);

        await expect(parametersBankHandler(event)).rejects.toThrow(new CustomError(CustomResponse.B400000, ['Invalid data']));
    });

    it('debería lanzar un error si ocurre un error en el servicio de S3', async () => {
        
        const formData = { logo:undefined,entityName: 'TestBank' };
        const fileData = Buffer.from('file content');
        const validationResult = { value: formData, error: null };

        (getParameter as jest.Mock).mockResolvedValueOnce("TestTable");
        (getParameter as jest.Mock).mockResolvedValueOnce("TestBucket");
        (processFormDataHandler as jest.Mock).mockResolvedValueOnce({ formData, fileData });
        (ValidateBank as jest.Mock).mockReturnValueOnce(validationResult);
        (UpdateToS3Service as jest.Mock).mockRejectedValueOnce(new CustomError(CustomResponse.E500000));

        await expect(parametersBankHandler(event)).rejects.toThrow('Error interno del servidor.');
    });

    it('debería lanzar un error si ocurre un error en la actualización de DynamoDB', async () => {
        
        const formData = { logo:undefined, entityName: 'TestBank' };
        const fileData = Buffer.from('file content');
        const validationResult = { value: formData, error: null };

        (getParameter as jest.Mock).mockResolvedValueOnce("TestTable");
        (getParameter as jest.Mock).mockResolvedValueOnce("TestBucket");
        (processFormDataHandler as jest.Mock).mockResolvedValueOnce({ formData, fileData });
        (ValidateBank as jest.Mock).mockReturnValueOnce(validationResult);
        (UpdateToS3Service as jest.Mock).mockResolvedValueOnce(undefined);
        (updateBankService as jest.Mock).mockRejectedValueOnce(new CustomError(CustomResponse.E500000));

        await expect(parametersBankHandler(event)).rejects.toThrow('Error interno del servidor.');
    });
});

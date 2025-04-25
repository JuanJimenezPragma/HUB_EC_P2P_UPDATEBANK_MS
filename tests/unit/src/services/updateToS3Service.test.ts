import { UpdateToS3Service } from './../../../../src/services/updateToS3Service';
import { S3Client } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3');

describe('UpdateToS3Service', () => {
    let s3ClientSendMock: jest.Mock;

    beforeEach(() => {
        s3ClientSendMock = S3Client.prototype.send as jest.Mock;
    });

    it('should skip upload if no file data is provided', async () => {
    
        const filename = 'test-image.png';
        const bucketName = 'test-bucket';
        
        await UpdateToS3Service(filename, bucketName);

    
        expect(s3ClientSendMock).not.toHaveBeenCalled();
    });

    it('should throw an error if the upload fails', async () => {
    
        const errorMessage = 'Error interno del servidor.';
        s3ClientSendMock.mockRejectedValueOnce(new Error(errorMessage));

        const filename = 'test-image.png';
        const bucketName = 'test-bucket';
        const fileData = Buffer.from('file data');

    
        await expect(UpdateToS3Service(filename, bucketName, fileData)).rejects.toThrow(errorMessage);
    });
});

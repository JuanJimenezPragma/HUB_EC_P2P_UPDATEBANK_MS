import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CustomError } from '../error/customError';
import { CustomResponse } from '../constants/customResponses';


const s3Client = new S3Client();


export const UpdateToS3Service = async (  filename: string, bucketName: string, fileData?: Buffer ): Promise<void> => {

    if (!fileData || !filename) {
        console.info('No file data provided; skipping upload to S3');
        return;
    }
    
    const params = {
        Bucket: bucketName,
        Key: filename,
        Body: fileData,
        ContentType: 'image/png'
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        console.info('File uploaded successfully to S3');
        
    } catch (error: any) {
        console.error('Error uploading file to S3:', error);
        throw new CustomError(CustomResponse.E500000.withDetails("Error uploading file to S3"), ["Error uploading file to S3",error]);
    }
};

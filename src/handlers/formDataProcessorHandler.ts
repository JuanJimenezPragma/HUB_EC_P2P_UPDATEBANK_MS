import { ConfigurationBank } from './../interfaces/configurationBank.interface';
import Busboy from 'busboy';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { CustomError } from '../error/customError';
import { CustomResponse } from '../constants/customResponses';

export const processFormDataHandler = (event: APIGatewayProxyEvent): Promise<{ formData: Partial<ConfigurationBank>; fileData: Buffer | undefined }> => {
    return new Promise((resolve, reject) => {
        try {
        
            const contentType = event.headers['content-type'] ?? event.headers['Content-Type'];

            let fileData: Buffer[] = [];
            const formData: Partial<ConfigurationBank> = {};
        
            const config = { headers: { 'content-type': contentType ?? 'multipart/form-data' } };
            const busboy = Busboy(config);

            busboy.on('file', (fieldname: string, file: NodeJS.ReadableStream, filename: string, encoding: string, mimetype: string) => {
                            
                file.on('data', (data) => {
                    fileData.push(data);
                });

                file.on('end', () => {
                    console.info(`File [${fieldname}] finished`);
                });
            });

            busboy.on('field', (fieldname: string, val: string) => {
                switch (fieldname) {
                    case 'entityName':
                        formData[fieldname] = val;
                        break;
                    case 'isActive':
                        formData[fieldname] = String(val).toLowerCase() === 'true' ? true : String(val).toLowerCase() === 'false' ? false : undefined;
                        break;
                    case 'recipients':
                        formData[fieldname as keyof ConfigurationBank] = val.split(',') as any;
                        break;
                    case 'initial_amount':
                        formData[fieldname] = val
                        break;
                    case 'lowerLimit':
                        formData[fieldname] = val
                        break;
                    case 'upperLimit':
                        formData[fieldname] = val
                        break;
                    case 'denialLimit':
                        formData[fieldname] = val;
                        break;
                    default:
                        console.warn(`Unknown field: ${fieldname}`);
                }
            });

            busboy.on('finish', () => {
                try {
                    console.info('Finished processing form data');
                
                    const completeFileData = fileData.length > 0 ? Buffer.concat(fileData) : undefined;

                    if (completeFileData) {
                        formData['logo'] = (formData['entityName'] 
                            ? `${formData['entityName']?.toLowerCase().trim().replace(/\s+/g, '')}.png` 
                            : `${new Date().getTime().toString()}.png`).toLowerCase();
                    }
                    
                    resolve({ formData, fileData: completeFileData });
                } catch (error) {
                    console.error("Error during finish processing:", error);
                    reject(new CustomError(CustomResponse.E500000,["Error during finish processing form data"]));
                }
            });

            if (!event.body) {
                console.error("Error: Body is required.");
                return reject(new CustomError(CustomResponse.B400001,["Body is required."]));
            }

            const bodyBuffer = Buffer.from(event.body, 'base64');
            busboy.end(bodyBuffer);

        } catch (error: any) {
            console.error("Error processing form data handler:", error);
            reject(new CustomError(CustomResponse.E500002,["Error processing form data handler", error]));
        }
    });
};

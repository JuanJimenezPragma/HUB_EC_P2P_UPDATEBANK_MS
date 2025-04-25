import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse, successResponse } from './src/helpers/responseHelper';
import { CustomResponse } from './src/constants/customResponses';
import { parametersBankHandler } from './src/handlers/parametersBankHandler';
import { CustomError } from './src/error/customError';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let origin:string = event.headers?.Origin ?? event.headers?.origin ?? "";
    try {
        const response:CustomResponse = await parametersBankHandler(event)
        return successResponse(origin,response);
    } catch (error) {
        console.error(error);
        if (error instanceof CustomError) {
            return errorResponse(origin,error);
        } else {
            return errorResponse(origin,new CustomError(CustomResponse.E500000));
        }
    }
};

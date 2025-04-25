const jwt = require('jsonwebtoken')
import { APIGatewayProxyEvent } from "aws-lambda";
import { CustomResponse } from "../constants/customResponses";
import { CustomError } from "../error/customError";
import { updateBankService } from "../services/updateBankService";
import { ValidateBank } from "../utils/bank.validate";
import { ConfigurationBank } from "../interfaces/configurationBank.interface";
import { processFormDataHandler } from "./formDataProcessorHandler";
import { UpdateToS3Service } from "../services/updateToS3Service";
import { Auth } from "../interfaces/auth.interface";
import { BUCKET_IMAGE, DYNAMO_TABLE } from "../constants/constants";
import { getParameter } from "../utils/ssmClient";
import { ValidateBankActivation } from "../utils/bankActivate.validate";
import { notifyHandler } from "./notifyHandler";

export const parametersBankHandler = async (event: APIGatewayProxyEvent): Promise<CustomResponse> => {
    try {
        const tableName = await getParameter(DYNAMO_TABLE);
        const bucketName = await getParameter(BUCKET_IMAGE);
        const fiid = event.pathParameters?.fiid;
        const module = event.queryStringParameters?.module;

        console.log("**********************");
        console.log(fiid);
        console.log(module);
        console.log("**********************")
        const authHeader = event.headers.Authorization;
        
        if (!authHeader) {
            throw new CustomError(CustomResponse.B403000)
        }
        
        if (!tableName || !fiid || !bucketName) {
            throw new CustomError(CustomResponse.E500001);
        }
        

        const { formData, fileData } = await processFormDataHandler(event)

        let result;
        const isEntityActivation = formData.isActive !== undefined && formData.initial_amount === undefined;
        if(isEntityActivation){
            result = ValidateBankActivation ( formData );
        }else{
            result = ValidateBank( formData );
        }

        if (result.error) {
            const errorMessages: string[] = result.error.details.map(err => err.message);
            throw new CustomError(CustomResponse.B400000.withMessage(errorMessages[0]), errorMessages);
        }
        
        const bankData: ConfigurationBank = result.value;
        console.info(`Starting update process for table: ${tableName}`);
        
        await UpdateToS3Service( `images/${bankData.logo}`, bucketName, fileData)
        
        const decoded:Auth = jwt.decode(authHeader);

        await updateBankService(tableName, bankData,fiid);

        const entityName = await notifyHandler(tableName,fiid,decoded.email,isEntityActivation);

        console.info(`User ${decoded.email} requested changes on entity ${entityName} with fiid ${fiid}, Data sent: ${JSON.stringify(bankData)}`);

        console.info("All items updated successfully");

        if(isEntityActivation){
            if(formData.isActive){
                return CustomResponse.S201001;
            }else{
                return CustomResponse.S201002;
            }
        }else{
            return CustomResponse.S201000;
        }
        
    } catch (error) {
        console.error("Error processing request:", error);
        throw error
    }
};

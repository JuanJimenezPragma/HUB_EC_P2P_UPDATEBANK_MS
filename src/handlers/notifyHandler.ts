import { GetCommand } from "@aws-sdk/lib-dynamodb"
import { sendNotificationService } from "../services/sendNotificationService"
import { dynamoDb } from "../utils/dynamoDbClient";
import { SQS_TEMPLATE_ENTITY_STATUS } from "../constants/constants";
import { ConfigurationBank } from "../interfaces/configurationBank.interface";

export const notifyHandler = async (tableName:string, fiid:string, responsible:string, isEntityActivation:boolean) => {
    try {
        
        const primaryKey = {
          fiid: fiid,
          type: "configuration"
        };
    
        const getCommand = new GetCommand({
          TableName: tableName,
          Key: primaryKey,
        });
    
        const response:ConfigurationBank = (await dynamoDb.send(getCommand)).Item as ConfigurationBank;
        
        if (response) {
          if (isEntityActivation) {
            await sendNotificationService(response.entityName? response.entityName:"", responsible, SQS_TEMPLATE_ENTITY_STATUS,response.isActive);
          }
        } 

        return response.entityName
      } catch (error) {
        console.error("Error al notificar:", error);
      }
}
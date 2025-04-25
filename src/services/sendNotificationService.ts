import { randomUUID } from "crypto";
import { SQS_MESSAGE_GROUP_ID, SQS_PARAMS_ENTITY_NAME_KEY, SQS_PARAMS_ENTITY_RESPONSIBLE_KEY, SQS_PARAMS_ENTITY_STATUS_KEY, SQS_TYPE_SLACK } from "../constants/constants";
import { sqsTemplate } from "../interfaces/sqsTemplate.interface";
import { SqsSendMessage } from "../utils/sqsClient";

export const sendNotificationService = async (entityName:string, responsible: string, template:string,entityStatus?: boolean) => {

    const sqsUrl = process.env.SQS_NOTIFICATION_URL;

    if (!sqsUrl) {
        throw new Error("QueueUrl is not defined");
    }

    const sqsBodyParams:Array<{ key: string; value: string }> = 
    [{
        key: SQS_PARAMS_ENTITY_NAME_KEY,
        value: entityName,
      },
      {
        key: SQS_PARAMS_ENTITY_RESPONSIBLE_KEY,
        value: responsible,
      }
    ];

    if(entityStatus != undefined){
        sqsBodyParams.push({
            key: SQS_PARAMS_ENTITY_STATUS_KEY,
            value: entityStatus == true? "Activada" : "Inactivada",
          })
    }
    const sqsTemplate: sqsTemplate = {
        type: SQS_TYPE_SLACK,
        template: {
            name: template,
        },
        parameters: sqsBodyParams,
    }
    const sqsParams = {
        MessageBody: JSON.stringify([sqsTemplate]),
        QueueUrl: sqsUrl,
        MessageGroupId: SQS_MESSAGE_GROUP_ID,
        MessageDeduplicationId: randomUUID()
    }
    await SqsSendMessage(sqsParams);
}

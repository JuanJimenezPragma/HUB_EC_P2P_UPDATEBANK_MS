
import { SendMessageCommand, SendMessageCommandInput, SQSClient } from "@aws-sdk/client-sqs";

export async function SqsSendMessage( params:SendMessageCommandInput ){
  const client:SQSClient = new SQSClient();
  try {
    const command : SendMessageCommand = new SendMessageCommand(params);
    const data = await client.send(command);
    console.info(`Message sent successfully, message ID: ${JSON.stringify(data)}`);
  } catch (error:any) {
    console.error(error)
  }
};

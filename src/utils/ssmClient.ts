import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { CustomError } from "../error/customError";
import { CustomResponse } from "../constants/customResponses";

export async function getParameter(parameterName: string): Promise<string> {
  const ssmClient = new SSMClient();
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption: true,
  });

  try {
    const response = await ssmClient.send(command);

    if (response.Parameter?.Value) {
      return response.Parameter.Value;
    } else {
      throw new CustomError(
        CustomResponse.E500003.withDetails(`Parameter ${parameterName} not found or has no value.`)
      );
    }
  } catch (err) {
    throw new CustomError(
      CustomResponse.E500003.withDetails(`Error fetching parameter ${parameterName}`)
    );
  }
}

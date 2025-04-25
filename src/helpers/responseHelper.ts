import { HUB_SUBDOMAIN } from "../constants/constants";
import { CustomResponse } from "../constants/customResponses";
import { CustomError } from "../error/customError";

export function successResponse(origin:string,customResponse:CustomResponse, data?:string) {
    return {
      statusCode: customResponse.statusCode,
      headers: {
        "Access-Control-Allow-Origin": origin.includes(HUB_SUBDOMAIN) ? origin : "",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        statusCode: customResponse.statusCode,
        customStatusCode: customResponse.customStatusCode,
        message: customResponse.message,
        data,
      }),
    };
  }
  
export function errorResponse(origin:string,customError:CustomError) {
    return {
      statusCode: customError.statusCode,
      headers: {
        "Access-Control-Allow-Origin": origin.includes(HUB_SUBDOMAIN) ? origin : "",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        statusCode: customError.statusCode,
        customStatusCode: customError.customStatusCode,
        message: customError.message,
        details: customError.details
      }),
  };
}

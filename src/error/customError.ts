import { CustomResponse } from '../constants/customResponses';

export class CustomError extends Error {
    
    readonly statusCode: number;
    readonly customStatusCode: string;
    readonly details: string[];
    
    constructor(customResponse:CustomResponse, details: string[] = []) {
      super(customResponse.message);
      this.statusCode = customResponse.statusCode;
      this.details= details;
      this.customStatusCode = customResponse.customStatusCode;
    }
  }
  
  
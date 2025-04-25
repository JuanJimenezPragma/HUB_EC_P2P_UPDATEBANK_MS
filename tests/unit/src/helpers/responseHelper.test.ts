import { CustomResponse } from '../../../../src/constants/customResponses';
import { CustomError } from '../../../../src/error/customError';
import { successResponse, errorResponse } from '../../../../src/helpers/responseHelper';

describe('Response Helper Functions', () => {
    it('should return a success response with the provided data', () => {
        const customResponse = new CustomResponse(200, "CTUB-S200-000", "Operation successful");
        const data = "Test data";
        const origin = "origintest"

        const response = successResponse(origin,customResponse, data);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(JSON.stringify({
            statusCode: 200,
            customStatusCode: "CTUB-S200-000",
            message: "Operation successful",
            data: data
        }));
    });

    it('should return an error response with the provided details', () => {
        const customError = new CustomError(new CustomResponse(400, "CTUB-E400-001", "Invalid input"), ["Missing fiid", "Invalid data format"]);
        const origin = "origintest"
        const response = errorResponse(origin,customError);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(JSON.stringify({
            statusCode: 400,
            customStatusCode: "CTUB-E400-001",
            message: "Invalid input",
            details: ["Missing fiid", "Invalid data format"]
        }));
    });

    it('should return a success response without data', () => {
        const customResponse = new CustomResponse(201, "CTUB-S201-000", "Bank updated successfully");
        const origin = "origintest"
        const response = successResponse(origin,customResponse);

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(JSON.stringify({
            statusCode: 201,
            customStatusCode: "CTUB-S201-000",
            message: "Bank updated successfully",
            data: undefined
        }));
    });

    it('should return an error response with default error message when no details are provided', () => {
        const customError = new CustomError(new CustomResponse(500, "CTUB-E500-000", "Internal Server Error"));
        const origin = "origintest"
        const response = errorResponse(origin,customError);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual(JSON.stringify({
            statusCode: 500,
            customStatusCode: "CTUB-E500-000",
            message: "Internal Server Error",
            details: []
        }));
    });
});

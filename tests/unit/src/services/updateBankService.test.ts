import { dynamoDb } from '../../../../src/utils/dynamoDbClient';
import { ConfigurationBank } from '../../../../src/interfaces/configurationBank.interface';
import { CustomResponse } from '../../../../src/constants/customResponses';
import { CustomError } from '../../../../src/error/customError';
import { updateBankService } from '../../../../src/services/updateBankService';

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

jest.mock("../../../../src/utils/dynamoDbClient", () => ({
  dynamoDb: {
    send: jest.fn(),
  },
}));

describe("updateBankService", () => {
  const tableName = "TestTable";
  const fiid = "12345";
  const bankData: ConfigurationBank = {
    logo: "string",
    isActive: true,
    entityName: "BankTest",
    recipients: ["email1@mail.com","email2@mail.com"],
    initial_amount: '1000',
    lowerLimit: '100',
    upperLimit: '2000',
    denialLimit: '10',
    updated_at: "2024-03-21"
  };

  it("should update the item successfully", async () => {
    (dynamoDb.send as jest.Mock).mockResolvedValueOnce({});

    await expect(updateBankService(tableName, bankData, fiid)).resolves.not.toThrow();

    expect(dynamoDb.send).toHaveBeenCalledWith(
      expect.any(UpdateCommand)
    );
  });

  it("should throw CustomError when tableName or fiid is missing", async () => {
    await expect(updateBankService("", bankData, fiid)).rejects.toThrow(CustomError);
    await expect(updateBankService(tableName, bankData, "")).rejects.toThrow(CustomError);
  });

  it("should throw CustomError when item does not exist (ConditionalCheckFailedException)", async () => {
    (dynamoDb.send as jest.Mock).mockRejectedValueOnce({
      name: "ConditionalCheckFailedException",
    });

    await expect(updateBankService(tableName, bankData, fiid)).rejects.toThrowError(
      new CustomError(CustomResponse.B404000, [`Item with fiid: ${fiid} does not exist.`])
    );
  });

  it("should throw CustomError when table is not found (ResourceNotFoundException)", async () => {
    (dynamoDb.send as jest.Mock).mockRejectedValueOnce({
      name: "ResourceNotFoundException",
    });

    await expect(updateBankService(tableName, bankData, fiid)).rejects.toThrowError(
      new CustomError(CustomResponse.E500000, [`Table ${tableName} not found.`])
    );
  });

  it("should throw CustomError for any other DynamoDB error", async () => {
    const genericError = new Error("Unknown error");
    (dynamoDb.send as jest.Mock).mockRejectedValueOnce(genericError);

    await expect(updateBankService(tableName, bankData, fiid)).rejects.toThrow(CustomError);
  });
});

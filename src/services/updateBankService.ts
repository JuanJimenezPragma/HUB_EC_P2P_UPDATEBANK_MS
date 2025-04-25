import { CustomResponse } from './../constants/customResponses';
import { CustomError } from './../error/customError';
import { dynamoDb } from "../utils/dynamoDbClient";
import { ConfigurationBank } from "../interfaces/configurationBank.interface";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ConfigurationBankDB } from '../interfaces/configurationBankDB.interface';
import { cloneToConfigurationBankDB } from '../utils/cloneConfigurationBankDB';

const getUpdateExpression = (bankData: ConfigurationBankDB): string => {
    const fields = Object.keys(bankData) as Array<keyof ConfigurationBank>;

    const updateExpression = fields
        .map(field => `${field} = :${field}`)
        .join(', ');
    
    return updateExpression;
};

const getExpressionAttributeValues = (bankData: ConfigurationBankDB): { [key: string]: any } => {
    return Object.entries(bankData).reduce((acc, [key, value]) => {
        acc[`:${key}`] = value instanceof BigInt ? value.toString() : value;
        return acc;
    }, {} as { [key: string]: any });
};

export const updateBankService = async (tableName: string, bankData: ConfigurationBank, fiid: string): Promise<void> => {
    if (!tableName || !fiid) {
        throw new CustomError(CustomResponse.B404001, [`Table name or fiid is null.`]);
    }
    bankData.updated_at = new Date().toISOString();
    const bankDataDb = cloneToConfigurationBankDB(bankData)
    console.info(`Scanning table ${tableName} for items with type 'configuration'`);

    const updateParams = {
        TableName: tableName,
        Key: { fiid: fiid, type: "configuration" },
        UpdateExpression: `SET ${getUpdateExpression(bankDataDb)}`,
        ExpressionAttributeValues: getExpressionAttributeValues(bankDataDb),
        ConditionExpression: 'attribute_exists(fiid)'
    };

    try {
        const response = await dynamoDb.send(new UpdateCommand(updateParams));
        console.info(`Successfully updated item with fiid: ${fiid}`);
    } catch (error: any) {
        if (error.name === 'ConditionalCheckFailedException') {
            console.error(`Item with fiid: ${fiid} does not exist. Update not performed.`);
            throw new CustomError(CustomResponse.B404000, [`Item with fiid: ${fiid} does not exist.`,error]);
        } else if (error.name === 'ResourceNotFoundException') {
            console.error(`Table ${tableName} not found.`);
            throw new CustomError(CustomResponse.E500000, [`Table ${tableName} not found.`,error]);
        } else {
            console.error(`Failed to update item with fiid: ${fiid}. Error:`, error);
            throw new CustomError(CustomResponse.E500000, error);
        }
    }
};
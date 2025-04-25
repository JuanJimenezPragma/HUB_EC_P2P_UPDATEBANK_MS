import { ConfigurationBank } from "../interfaces/configurationBank.interface";
import { ConfigurationBankDB } from "../interfaces/configurationBankDB.interface";

export function cloneToConfigurationBankDB(config: ConfigurationBank): ConfigurationBankDB {
    const result: Partial<ConfigurationBankDB> = {};

    Object.entries(config).forEach(([key, value]) => {
        if (value !== undefined) {
            result[key as keyof ConfigurationBankDB] = 
                ["initial_amount", "lowerLimit", "upperLimit", "denialLimit"].includes(key) && typeof value === "string"
                    ? convertToBigInt(value)
                    : value;
        }
    });

    return result as ConfigurationBankDB;
}

const convertToBigInt = (val: string) => {
    let [integerPart, decimalPart = ''] = val.split('.');

    decimalPart = (decimalPart + '00').slice(0, 2);

    let resultString = integerPart + decimalPart;
    return BigInt(resultString);
}

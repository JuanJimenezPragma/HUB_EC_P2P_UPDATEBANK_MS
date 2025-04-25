export interface ConfigurationBankDB {
    logo?: string,
    isActive?: boolean,
    entityName?: string,
    recipients?: string[],
    initial_amount?: BigInt,
    lowerLimit?: BigInt,
    upperLimit?: BigInt,
    denialLimit?: BigInt,
    updated_at?: string
}


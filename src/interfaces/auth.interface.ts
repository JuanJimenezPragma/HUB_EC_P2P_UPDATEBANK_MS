import { Identity } from "./identity.interfase";

export interface Auth {
    at_hash: string,
    sub: string,
    cognitogroups: Array<string>,
    email_verified: boolean,
    iss: string,
    cognito_username: string,
    origin_jti: string,
    aud: string,
    identities: Array<Identity>,
    token_use: string,
    auth_time: number,
    name: string,
    exp: number,
    iat: number,
    jti: string,
    email: string
  }
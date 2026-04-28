export const environment = {
    prod:true,
    configPaths:['/config/config.json'],
    tokenKey: "{ENV:TOKEN_HASH_KEY}",
    token: "token",
    derivationTokenKey: "{ENV:DERIVATED_TOKEN_HASH_KEY}",
    tokenHeader: "X-Token"
};

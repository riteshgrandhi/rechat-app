const env = "dev";

let _config = require(`./config.${env}.json`);

export const Config = _config;

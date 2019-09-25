const env = "dev";

interface IClientConfig {
  serverUrl: string;
  logLevel: string;
}

let _config: IClientConfig = require(`./config.${env}.json`);

export const Config = _config;

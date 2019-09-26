const env = "dev";

interface IServerConfig {
  clientUrl: string;
  logLevel: string;
  connectionString: string;
  jwtSecret: string;
}

let _config: IServerConfig = require(`./config.${env}.json`);

export const Config = _config;

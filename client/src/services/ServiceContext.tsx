import { Logger, LogLevel } from "@common";
import AuthService from "./AuthService";
import ApiService from "./ApiService";
import React from "react";
import { Config } from "../config/appConfig";

export interface IServiceContext {
  readonly logger: Logger;
  readonly authService: AuthService;
  readonly apiService: ApiService;
}

let _level: LogLevel = LogLevel[Config.logLevel as keyof typeof LogLevel];
let _logger = new Logger(_level);
let _authService = new AuthService(_logger);
let _apiService = new ApiService(_logger, _authService);

export const defaultContextValue: IServiceContext = {
  logger: _logger,
  authService: _authService,
  apiService: _apiService
};

const ServiceContext = React.createContext<IServiceContext>(
  defaultContextValue
);
export default ServiceContext;
// export const ServiceContextConsumer: FunctionComponent = ({
//   children
// }) => {
//   return <ServiceContext.Consumer>{value => children}</ServiceContext.Consumer>;
// };
// export function withAppContext<
//   P extends { appContext?: ServiceContextProps },
//   R = Omit<P, "appContext">
// >(
//   Component: React.ComponentClass<R> | React.StatelessComponent<R>
// ): React.SFC<R> {
//   return function BoundComponent(props: R) {
//     return (
//       <ServiceContext.Consumer>
//         {value => <Component {...props} appContext={value} />}
//       </ServiceContext.Consumer>
//     );
//   };
// }

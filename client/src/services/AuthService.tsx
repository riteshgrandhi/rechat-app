import axios, { AxiosError } from "axios";
import {
  IUser,
  ISignUpResponse,
  ILoginResponse,
  Logger,
  LogLevel
} from "@common";
import { Config } from "../config/appConfig";

export default class AuthService {
  public isAuthenticated: boolean;
  private logger: Logger;
  // private _token?: string;

  constructor(logger: Logger) {
    this.logger = logger;
    this.isAuthenticated = this.getToken() != null;
  }

  public getToken(): string | null {
    return sessionStorage.getItem("access_token");
  }

  public async login(email: string, password: string): Promise<ILoginResponse> {
    try {
      return await axios
        .post<ILoginResponse>(`${Config.serverUrl}/auth/login`, {
          email: email,
          password: password
        })
        .then(resp => {
          if (!resp.data.token) {
            throw resp;
          }
          let token = resp.data.token;
          sessionStorage.setItem("access_token", token);
          this.isAuthenticated = true;
          return resp.data;
        })
        .catch((err: AxiosError<ILoginResponse>) => {
          throw err.response ? err.response.data : err;
        });
    } catch (err) {
      this.logger.log(AuthService.name, "Login Response", LogLevel.ERROR, err);
      throw err;
    }
  }

  public async signup(user: IUser, password: string): Promise<ISignUpResponse> {
    try {
      return await axios
        .post<ISignUpResponse>(`${Config.serverUrl}/auth/signup`, {
          // userName: user.userName,
          email: user.email,
          password: password,
          firstName: user.firstName,
          lastName: user.lastName
        })
        .then(resp => resp.data)
        .catch((err: AxiosError<ISignUpResponse>) => {
          throw err.response ? err.response.data : err;
        });
    } catch (err) {
      this.logger.log(AuthService.name, "Sign Up Response", LogLevel.ERROR);
      throw err;
    }
  }

  public logout(noReload?: boolean): void {
    sessionStorage.clear();
    if (!noReload) {
      window.location.reload();
    }
  }
}

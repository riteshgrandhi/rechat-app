import { AxiosResponse } from "axios";
import { axiosNoAuth } from "./AxiosInstance";
import {
  IUser,
  ISignUpResponse,
  ILoginResponse,
  Logger,
  LogLevel
} from "@common";

export default class AuthService {
  public isAuthenticated: boolean;
  private logger: Logger;
  private _token?: string;

  constructor(logger: Logger) {
    this.logger = logger;
    this.isAuthenticated = false;
  }

  public getToken(): string {
    if (!this._token) {
      throw "Token is missing";
    }
    return this._token;
  }

  public async login(
    userName: string,
    password: string
  ): Promise<ILoginResponse> {
    try {
      return await axiosNoAuth
        .post<any, AxiosResponse<ILoginResponse>>("/auth/login", {
          userName: userName,
          password: password
        })
        .then(resp => {
          if (!resp.data.token) {
            throw "login failed";
          }
          this._token = resp.data.token;
          this.isAuthenticated = true;
          return resp.data;
        });
    } catch (err) {
      this.logger.log(AuthService.name, "Login Response", LogLevel.ERROR);
      throw err;
    }
  }

  public async signup(user: IUser, password: String): Promise<ISignUpResponse> {
    try {
      return await axiosNoAuth
        .post<any, AxiosResponse<ISignUpResponse>>("/auth/signup", {
          userName: user.userName,
          password: password,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        })
        .then(resp => resp.data);
    } catch (err) {
      this.logger.log(AuthService.name, "Sign Up Response", LogLevel.ERROR);
      throw err;
    }
  }
}

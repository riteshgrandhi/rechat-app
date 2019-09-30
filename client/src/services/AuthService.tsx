import axios from "axios";
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

  public async login(
    userName: string,
    password: string
  ): Promise<ILoginResponse> {
    try {
      return await axios
        .post<ILoginResponse>(`${Config.serverUrl}/auth/login`, {
          userName: userName,
          password: password
        })
        .then(resp => {
          if (!resp.data.token) {
            throw "login failed";
          }
          let token = resp.data.token;
          sessionStorage.setItem("access_token", token);
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
      return await axios
        .post<ISignUpResponse>(`${Config.serverUrl}/auth/signup`, {
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

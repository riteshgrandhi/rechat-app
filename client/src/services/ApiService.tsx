import axios, { AxiosInstance } from "axios";
import { Config } from "../config/appConfig";
import AuthService from "./AuthService";
import { Logger } from "@common";

export default class ApiService {
  private logger: Logger;
  private authService: AuthService;
  public axiosAuth: AxiosInstance;
  public axiosNoAuth: AxiosInstance;

  constructor(logger: Logger, authService: AuthService) {
    this.logger = logger;
    this.authService = authService;
    this.axiosAuth = this.createAuthInstance(authService);
    this.axiosNoAuth = this.createNoAuthInstance();
  }

  private createAuthInstance(auth: AuthService): AxiosInstance {
    let _instance = axios.create({
      baseURL: Config.serverUrl,
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      params: {}
    });

    _instance.interceptors.request.use(async function(config) {
      config.headers = { Authorization: "Bearer " + auth.getToken() };
      return config;
    });

    return _instance;
  }

  private createNoAuthInstance(): AxiosInstance {
    return axios.create({
      baseURL: Config.serverUrl,
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      params: {}
    });
  }
}

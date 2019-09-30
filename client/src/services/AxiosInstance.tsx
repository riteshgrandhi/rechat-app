import axios, { AxiosInstance } from "axios";
import { Config } from "../config/appConfig";
import AuthService from "./AuthService";

let _authService: AuthService;

const init = (authService: AuthService) => {
  _authService = authService;
};

const axiosAuth: AxiosInstance = (() => {
  let _instance = axios.create({
    baseURL: Config.serverUrl,
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    params: {}
  });

  _instance.interceptors.request.use(async config => {
    config.headers = { Authorization: "Bearer " + _authService.getToken() };
    return config;
  });

  return _instance;
})();

const axiosNoAuth: AxiosInstance = axios.create({
  baseURL: Config.serverUrl,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json"
  },
  params: {}
});

export { axiosAuth, axiosNoAuth, init as default };

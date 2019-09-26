import { IUser } from "..";

interface IResponse {
  message: string;
  error?: any;
}

export interface IDataResponse<T> extends IResponse {
  data?: T;
}

export interface ILoginResponse extends IResponse {
  user?: IUser;
  token?: string;
}

export interface ISignUpResponse extends IResponse {
  user?: IUser;
}

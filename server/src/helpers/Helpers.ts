import { Response } from "express";

// Generic typed response, we omit 'json' and we add a new json method with the desired parameter type
export type TypedResponse<T> = Omit<Response, "json" | "status" | "send"> & {
  json(data: T): TypedResponse<T>;
  status(code: number): TypedResponse<T>;
  send: (body?: any) => TypedResponse<T>;
};

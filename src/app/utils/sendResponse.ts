import { Response } from "express";

type TSendResponse<T, U, V> = {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: U;
  data: T;
  viewerContext?: V;
};

/**
 * @param res res  object
 * @param data data
 */
const sendResponse = <T, U, V>(res: Response, data: TSendResponse<T, U, V>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data?.meta,
    data: data.data,
    viewerContext: data?.viewerContext,
  });
};

export default sendResponse;

import { Response } from "express";

interface IResponseData<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
}

export const sendResponse = <T>(
  res: Response,
  responseData: IResponseData<T>,
) => {
  const { statusCode, success, message, data, meta } = responseData;

  res.status(statusCode).json({
    success,
    message,
    data,
    meta,
  });
};

import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const param = (req: Request, key: string) => req.params[key] as string;

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentById(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
});

const getPaymentByOrderId = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentByOrderId(
    param(req, "orderId"),
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
});

const listPayments = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await PaymentService.listPayments(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updatePayment = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await PaymentService.updatePayment(
    param(req, "id"),
    req.body,
    user.userId,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment updated successfully",
    data: result,
  });
});

export const PaymentController = {
  getPaymentById,
  getPaymentByOrderId,
  listPayments,
  updatePayment,
};

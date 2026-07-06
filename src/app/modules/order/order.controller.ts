import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { OrderService } from "./order.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const param = (req: Request, key: string) => req.params[key] as string;

// ==================== ORDER ====================

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await OrderService.createOrder(req.body, user.userId);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderById(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Order retrieved successfully",
    data: result,
  });
});

const getOrderByOrderNumber = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrderService.getOrderByOrderNumber(
      param(req, "orderNumber"),
    );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Order retrieved successfully",
      data: result,
    });
  },
);

const listOrders = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);

  // Non-super-admins can only see their own orders
  const isSuperAdmin = user.storeScopes.some(
    (s) => s.roleKey === "super_admin" && s.storeId === null,
  );
  const userId = isSuperAdmin ? undefined : user.userId;

  const result = await OrderService.listOrders(req.query, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await OrderService.updateOrderStatus(
    param(req, "id"),
    req.body,
    user.userId,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

const updateTrackingNumber = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateTrackingNumber(
    param(req, "id"),
    req.body.trackingNumber,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Tracking number updated successfully",
    data: result,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await OrderService.cancelOrder(param(req, "id"), user.userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Order cancelled successfully",
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getOrderById,
  getOrderByOrderNumber,
  listOrders,
  updateOrderStatus,
  updateTrackingNumber,
  cancelOrder,
};

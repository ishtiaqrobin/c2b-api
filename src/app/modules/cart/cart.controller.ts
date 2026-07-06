import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CartService } from "./cart.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const param = (req: Request, key: string) => req.params[key] as string;

// Get my cart (authenticated user)
const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const cart = await CartService.getOrCreateCart(user.userId);
  const fullCart = await CartService.getCart(cart.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Cart retrieved successfully",
    data: fullCart,
  });
});

// Get cart by ID (admin)
const getCartById = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await CartService.getCart(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Cart retrieved successfully",
    data: result,
  });
});

// Add item to cart
const addItem = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const cart = await CartService.getOrCreateCart(user.userId);
  const result = await CartService.addItem(cart.id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Item added to cart",
    data: result,
  });
});

// Update cart item
const updateItem = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await CartService.updateItem(param(req, "itemId"), req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Cart item updated",
    data: result,
  });
});

// Remove items from cart
const removeItems = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const cart = await CartService.getOrCreateCart(user.userId);
  const result = await CartService.removeItems(cart.id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Items removed from cart",
    data: result,
  });
});

// Clear cart
const clearCart = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const cart = await CartService.getOrCreateCart(user.userId);
  const result = await CartService.clearCart(cart.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Cart cleared",
    data: result,
  });
});

// Merge guest cart into user cart (called after login)
const mergeGuestCart = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const { sessionId } = req.body;
  if (!sessionId) {
    throw new AppError(status.BAD_REQUEST, "sessionId is required");
  }
  const result = await CartService.mergeGuestCart(sessionId, user.userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Guest cart merged successfully",
    data: result,
  });
});

// Admin: cleanup expired cart items
const cleanupExpired = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const count = await CartService.cleanupExpiredItems();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `${count} expired cart items removed`,
    data: { removedCount: count },
  });
});

export const CartController = {
  getMyCart,
  getCartById,
  addItem,
  updateItem,
  removeItems,
  clearCart,
  mergeGuestCart,
  cleanupExpired,
};

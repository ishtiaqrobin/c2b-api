import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import AppError from "../../errorHelpers/AppError";

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.register(req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message:
      "Registration successful. Please check your email to verify your account.",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  }

  const result = await UserService.getMe(req.user.userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

export const UserController = {
  register,
  getMe,
};

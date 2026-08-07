import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await UserService.getMyProfile(user.userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const uploadedImageUrl = req.file ? req.file.path : undefined;
  const result = await UserService.updateMyProfile(
    user.userId,
    req.body,
    uploadedImageUrl,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const updatePayoutInfo = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await UserService.updatePayoutInfo(user.userId, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payout info updated successfully",
    data: result,
  });
});

export const UserController = {
  getMyProfile,
  updateMyProfile,
  updatePayoutInfo,
};
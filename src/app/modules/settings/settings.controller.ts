import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { SettingsService } from "./settings.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

// Public: get settings
const getSettings = catchAsync(async (_req: Request, res: Response) => {
  const result = await SettingsService.getSettings();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Settings retrieved",
    data: result,
  });
});

// Admin: update settings
const updateSettings = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await SettingsService.updateSettings(req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Settings updated",
    data: result,
  });
});

export const SettingsController = {
  getSettings,
  updateSettings,
};

import status from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import { cookieUtils } from "../../utils/cookie";
import { env } from "../../../app/config/env";
import { auth } from "../../lib/auth";
import AppError from "../../errorHelpers/AppError";

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  }

  const result = await AuthService.getMe(req.user.userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

  if (sessionToken) {
    await AuthService.logout(sessionToken);
  }

  // Clear the session cookie on the client side as well.
  cookieUtils.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Logged out successfully",
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const headers = new Headers();

  // Reconstruct headers exactly as needed for better-auth Web API
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const result = await AuthService.changePassword(payload, headers);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await AuthService.verifyEmail(email, otp);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Email verified successfully",
    data: null,
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgetPassword(req.body.email);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password reset OTP sent to email",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  await AuthService.resetPassword(email, otp, newPassword);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password reset successfully",
    data: null,
  });
});

export const AuthController = {
  getMe,
  logout,
  changePassword,
  verifyEmail,
  forgetPassword,
  resetPassword,
};

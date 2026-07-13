import status from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import { cookieUtils } from "../../utils/cookie";
import { env } from "../../../app/config/env";
import { auth } from "../../lib/auth";
import AppError from "../../errorHelpers/AppError";
import { tokenUtils } from "../../utils/token";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await AuthService.registerUser(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message:
      "Registration successful. Please check your email to verify your account.",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  }

  const result = await AuthService.getMe(req.user.userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];

  if (!refreshToken) {
    throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
  }
  const result = await AuthService.getNewToken(
    refreshToken,
    betterAuthSessionToken,
  );

  const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "New tokens generated successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken,
    },
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];

  console.log("betterAuthSessionToken", betterAuthSessionToken);

  const result = await AuthService.changePassword(
    payload,
    betterAuthSessionToken,
  );

  const { accessToken, refreshToken, token } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

  if (sessionToken) {
    await AuthService.logoutUser(sessionToken);
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
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
};

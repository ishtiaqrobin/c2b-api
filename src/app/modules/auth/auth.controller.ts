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

// GET /api/v1/auth/login/google?redirect=/dashboard
const googleLogin = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath);

  const callbackURL = `${env.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;

  res.render("googleRedirect", {
    callbackURL,
    betterAuthUrl: env.BETTER_AUTH_URL,
  });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/dashboard";
  const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

  if (!sessionToken) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }

  const session = await auth.api.getSession({
    headers: new Headers({
      Cookie: `better-auth.session_token=${sessionToken}`,
    }),
  });

  if (!session || !session.user) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=no_session_found`);
  }

  // Session-only: no tokens to set, just run post-login setup.
  await AuthService.googleLoginSuccess(session as never);

  const isValidRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

  res.redirect(`${env.FRONTEND_URL}${finalRedirectPath}?auth=success`);
});

const handleOAuthError = catchAsync(async (req: Request, res: Response) => {
  const error = (req.query.error as string) || "oauth_failed";
  res.redirect(`${env.FRONTEND_URL}/login?error=${error}`);
});

export const AuthController = {
  getMe,
  logout,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError,
};

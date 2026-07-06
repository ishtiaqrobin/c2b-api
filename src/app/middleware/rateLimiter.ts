import rateLimit from "express-rate-limit";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

/**
 * Strict rate limiter for auth / OTP endpoints.
 * 10 requests per 15-minute window per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts. Please try again in 15 minutes.",
  },
  handler: (_req, _res, next) => {
    next(
      new AppError(
        status.TOO_MANY_REQUESTS,
        "Too many auth attempts. Please try again in 15 minutes.",
      ),
    );
  },
});

/**
 * General API rate limiter.
 * 100 requests per 15-minute window per IP.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  handler: (_req, _res, next) => {
    next(
      new AppError(
        status.TOO_MANY_REQUESTS,
        "Too many requests. Please slow down.",
      ),
    );
  },
});

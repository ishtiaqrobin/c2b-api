/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";

import { env } from "../config/env";
import status from "http-status";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import { handleZodError } from "../errorHelpers/handleZodError";
import { handlePrismaError } from "../errorHelpers/handlePrismaError";
import {
  handlePrismaValidationError,
  handlePrismaInitError,
} from "../errorHelpers/handlePrismaValidationError";
import AppError from "../errorHelpers/AppError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (env.NODE_ENV === "development") {
    console.log("🔥 Global Error Handler:", err);
  }

  // Clean up uploaded files on error (rollback Cloudinary uploads)
  if (req.file) {
    await deleteFileFromCloudinary((req.file as any).path);
  }
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imageUrls = (req.files as any[]).map((file) => file.path);
    await Promise.all(imageUrls.map((url) => deleteFileFromCloudinary(url)));
  }

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Something went wrong";
  let errorSources: TErrorSources[] = [];
  let stack: string | undefined = undefined;

  // ─── Prisma Known Request Errors (P2002, P2003, P2025, etc.) ───
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const result = handlePrismaError(err);
    statusCode = result.statusCode;
    message = result.message;
    errorSources = result.errorSources;
    stack = err.stack;
  }
  // ─── Prisma Validation Errors (invalid types, missing args) ───
  else if (err instanceof Prisma.PrismaClientValidationError) {
    const result = handlePrismaValidationError(err);
    statusCode = result.statusCode;
    message = result.message;
    errorSources = result.errorSources;
    stack = err.stack;
  }
  // ─── Prisma Initialization / Connection Errors ───
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    const result = handlePrismaInitError(err);
    statusCode = result.statusCode;
    message = result.message;
    errorSources = result.errorSources;
    stack = err.stack;
  }
  // ─── Zod Validation Errors ───
  else if (err.name === "ZodError") {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  }
  // ─── Custom App Errors ───
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }
  // ─── Generic Errors ───
  else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message || "Internal Server Error";
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message || "Internal Server Error",
      },
    ];
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message,
    errorSources,
    stack: env.NODE_ENV === "development" ? stack : undefined,
    error: env.NODE_ENV === "development" ? err : undefined,
  };

  res.status(statusCode).json(errorResponse);
};

export default globalErrorHandler;

import status from "http-status";
import { TErrorSources } from "../interfaces/error.interface";
import { Prisma } from "../../generated/prisma/client";

interface PrismaErrorResult {
  statusCode: number;
  message: string;
  errorSources: TErrorSources[];
}

/**
 * Handles Prisma validation errors (e.g. invalid field types, missing args).
 */
export const handlePrismaValidationError = (
  err: Prisma.PrismaClientValidationError,
): PrismaErrorResult => {
  return {
    statusCode: status.BAD_REQUEST,
    message: "Invalid data provided. Please check your input and try again.",
    errorSources: [
      {
        path: "",
        message: extractValidationMessage(err.message),
      },
    ],
  };
};

/**
 * Handles Prisma initialization / connection errors.
 */
export const handlePrismaInitError = (
  err: Prisma.PrismaClientInitializationError,
): PrismaErrorResult => {
  return {
    statusCode: status.INTERNAL_SERVER_ERROR,
    message: "Database connection failed. Please try again later.",
    errorSources: [
      {
        path: "",
        message: `Database initialization error [${err.errorCode}]: ${err.message}`,
      },
    ],
  };
};

/**
 * Extracts a user-friendly message from Prisma validation error strings.
 * Prisma validation errors are often long stack traces; we extract the key part.
 */
function extractValidationMessage(rawMessage: string): string {
  // Common patterns in Prisma validation errors
  const patterns = [
    /Argument `(\w+)`:/,
    /Field `(\w+)`:/,
    /Missing required argument `(\w+)`/,
    /Unknown argument `(\w+)`/,
    /Invalid value for argument `(\w+)`/,
  ];

  for (const pattern of patterns) {
    const match = rawMessage.match(pattern);
    if (match) {
      return `Validation error: ${rawMessage.split("\n")[0]}`;
    }
  }

  // Fallback: return first line only
  return rawMessage.split("\n")[0] || "Invalid input data.";
}

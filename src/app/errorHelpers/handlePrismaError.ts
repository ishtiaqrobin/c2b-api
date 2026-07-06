import status from "http-status";
import { TErrorSources } from "../interfaces/error.interface";
import { Prisma } from "../../generated/prisma/client";

// Human-readable messages for common Prisma error codes.
const PRISMA_ERROR_MESSAGES: Record<
  string,
  { status: number; message: string }
> = {
  P2002: {
    status: status.CONFLICT,
    message:
      "A record with this value already exists. Please use a different value.",
  },
  P2003: {
    status: status.BAD_REQUEST,
    message: "The referenced record does not exist. Please check your input.",
  },
  P2011: {
    status: status.BAD_REQUEST,
    message:
      "A required field is missing or null. Please fill in all required fields.",
  },
  P2014: {
    status: status.BAD_REQUEST,
    message:
      "The record you are trying to create already exists with a different relationship.",
  },
  P2025: {
    status: status.NOT_FOUND,
    message: "The requested record was not found. It may have been deleted.",
  },
};

interface PrismaErrorResult {
  statusCode: number;
  message: string;
  errorSources: TErrorSources[];
}

/**
 * Handles known Prisma errors and returns a structured, user-friendly response.
 * Falls back to a generic database error for unknown Prisma errors.
 */
export const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): PrismaErrorResult => {
  const knownError = PRISMA_ERROR_MESSAGES[err.code];

  if (knownError) {
    // Extract the field name from the constraint metadata if available.
    const constraintFields = extractConstraintFields(err);
    const fieldHint =
      constraintFields.length > 0 ? ` (${constraintFields.join(", ")})` : "";

    return {
      statusCode: knownError.status,
      message: `${knownError.message}${fieldHint}`,
      errorSources: constraintFields.map((field) => ({
        path: field,
        message: getConstraintMessage(err.code, field),
      })),
    };
  }

  // Unknown Prisma error — return a safe generic message.
  return {
    statusCode: status.INTERNAL_SERVER_ERROR,
    message: "A database error occurred. Please try again later.",
    errorSources: [
      {
        path: "",
        message: `Database error [${err.code}]: ${err.message}`,
      },
    ],
  };
};

/**
 * Extracts field names from Prisma error metadata.
 */
function extractConstraintFields(
  err: Prisma.PrismaClientKnownRequestError,
): string[] {
  // Prisma constraint errors include target fields in the error.
  // Try to extract from the raw driver error first.
  const driverError = (err.meta as Record<string, unknown>)
    ?.driverAdapterError as
    | { cause?: { constraint?: { fields?: string[] } } }
    | undefined;

  if (driverError?.cause?.constraint?.fields) {
    return driverError.cause.constraint.fields;
  }

  // Fallback: try to parse from the target field in meta.
  const target = err.meta?.target;
  if (Array.isArray(target)) {
    return target as string[];
  }
  if (typeof target === "string") {
    return [target];
  }

  return [];
}

/**
 * Returns a field-specific human-readable message.
 */
function getConstraintMessage(code: string, field: string): string {
  switch (code) {
    case "P2002":
      return `The value for "${field}" is already taken. Please choose a different value.`;
    case "P2003":
      return `The referenced "${field}" does not exist.`;
    case "P2011":
      return `"${field}" is required and cannot be null.`;
    default:
      return `Invalid value for "${field}".`;
  }
}

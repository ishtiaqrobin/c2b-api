import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import status from "http-status";
import AppError from "../errorHelpers/AppError";

export const validateRequest =
  (zodSchema: z.ZodType) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Support multipart/form-data where JSON is sent in a "data" field.
      if (req.body?.data) {
        try {
          req.body = JSON.parse(req.body.data);
        } catch {
          throw new AppError(
            status.BAD_REQUEST,
            "Invalid JSON in 'data' field",
          );
        }
      }

      const parseResult = zodSchema.safeParse(req.body);

      if (!parseResult.success) {
        return next(parseResult.error); // return so we don't continue
      }

      req.body = parseResult.data; // sanitized data
      next();
    } catch (error) {
      next(error);
    }
  };

/** Validates req.query and attaches the parsed result to req.validatedQuery. */
export const validateQuery =
  (zodSchema: z.ZodType) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parseResult = zodSchema.safeParse(req.query);

      if (!parseResult.success) {
        return next(parseResult.error);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).validatedQuery = parseResult.data;
      next();
    } catch (error) {
      next(error);
    }
  };

import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BuybackFeatureService } from "./buyback.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const param = (req: Request, key: string) => req.params[key] as string;

const extractFileInfo = (req: Request) => {
  if (!req.file) {
    throw new AppError(status.BAD_REQUEST, "Image is required");
  }

  const file = req.file as Express.Multer.File & {
    path?: string;
    filename?: string;
    [key: string]: unknown;
  };

  const imageUrl =
    (file.path as string) ||
    ((file as Record<string, unknown>).location as string);
  const imagePublicId =
    (file.filename as string) ||
    ((file as Record<string, unknown>).public_id as string) ||
    null;

  if (!imageUrl) {
    throw new AppError(status.BAD_REQUEST, "File upload failed");
  }

  return { imageUrl, imagePublicId };
};

const list = catchAsync(async (req: Request, res: Response) => {
  const query =
    (req as unknown as Record<string, unknown>).validatedQuery ?? req.query;
  const result = await BuybackFeatureService.list(query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Buyback features retrieved",
    data: result.data,
    meta: result.meta,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await BuybackFeatureService.getById(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Buyback feature retrieved",
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const { imageUrl, imagePublicId } = extractFileInfo(req);
  const result = await BuybackFeatureService.create({
    ...req.body,
    imageUrl,
    imagePublicId,
  });
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Buyback feature created",
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);

  let imageUrl: string | undefined;
  let imagePublicId: string | null | undefined;

  if (req.file) {
    const fileInfo = extractFileInfo(req);
    imageUrl = fileInfo.imageUrl;
    imagePublicId = fileInfo.imagePublicId;
  }

  const result = await BuybackFeatureService.update(param(req, "id"), {
    ...req.body,
    ...(imageUrl !== undefined ? { imageUrl } : {}),
    ...(imagePublicId !== undefined ? { imagePublicId } : {}),
  });
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Buyback feature updated",
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  await BuybackFeatureService.remove(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Buyback feature deleted",
    data: null,
  });
});

export const BuybackFeatureController = {
  list,
  getById,
  create,
  update,
  remove,
};

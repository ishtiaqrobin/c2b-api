import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BannerService } from "./banner.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const param = (req: Request, key: string) => req.params[key] as string;

// Public: list banners
const listBanners = catchAsync(async (req: Request, res: Response) => {
  const query =
    (req as unknown as Record<string, unknown>).validatedQuery ?? req.query;
  const result = await BannerService.listBanners(query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Banners retrieved",
    data: result.data,
    meta: result.meta,
  });
});

// Public: get single banner
const getBannerById = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.getBannerById(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Banner retrieved",
    data: result,
  });
});

// Admin: create banner
const createBanner = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await BannerService.createBanner(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Banner created",
    data: result,
  });
});

// Admin: update banner
const updateBanner = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await BannerService.updateBanner(param(req, "id"), req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Banner updated",
    data: result,
  });
});

// Admin: delete banner (soft delete)
const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  await BannerService.deleteBanner(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Banner deleted",
    data: null,
  });
});

export const BannerController = {
  listBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};

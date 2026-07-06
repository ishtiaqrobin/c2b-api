import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { NewsService } from "./news.service";
import AppError from "../../errorHelpers/AppError";
import { Locale } from "../../../generated/prisma/enums";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const param = (req: Request, key: string) => req.params[key] as string;

// Public: list news
const listNews = catchAsync(async (req: Request, res: Response) => {
  const query =
    (req as unknown as Record<string, unknown>).validatedQuery ?? req.query;
  const result = await NewsService.listNews(query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "News retrieved",
    data: result.data,
    meta: result.meta,
  });
});

// Public: get single news
const getNewsById = catchAsync(async (req: Request, res: Response) => {
  const locale = req.query.locale as string | undefined;
  const result = await NewsService.getNewsById(
    param(req, "id"),
    locale as Locale | undefined,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "News retrieved",
    data: result,
  });
});

// Admin: create news
const createNews = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await NewsService.createNews(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "News created",
    data: result,
  });
});

// Admin: update news
const updateNews = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await NewsService.updateNews(param(req, "id"), req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "News updated",
    data: result,
  });
});

// Admin: delete news (soft delete)
const deleteNews = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  await NewsService.deleteNews(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "News deleted",
    data: null,
  });
});

export const NewsController = {
  listNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
};

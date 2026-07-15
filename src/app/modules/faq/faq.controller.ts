import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { FaqService } from "./faq.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const param = (req: Request, key: string) => req.params[key] as string;

const listFaqs = catchAsync(async (req: Request, res: Response) => {
  const query =
    (req as unknown as Record<string, unknown>).validatedQuery ?? req.query;
  const result = await FaqService.listFaqs(query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "FAQs retrieved",
    data: result.data,
    meta: result.meta,
  });
});

const getFaqById = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqService.getFaqById(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "FAQ retrieved",
    data: result,
  });
});

const createFaq = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await FaqService.createFaq(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "FAQ created",
    data: result,
  });
});

const updateFaq = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await FaqService.updateFaq(param(req, "id"), req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "FAQ updated",
    data: result,
  });
});

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  await FaqService.deleteFaq(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "FAQ deleted",
    data: null,
  });
});

export const FaqController = {
  listFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
};

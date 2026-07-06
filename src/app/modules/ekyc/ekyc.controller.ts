import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { EkycService } from "./ekyc.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const param = (req: Request, key: string) => req.params[key] as string;

// Customer: get my eKYC status
const getMyEkyc = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await EkycService.getMyEkyc(user.userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "eKYC record retrieved",
    data: result,
  });
});

// Customer: upload document
const uploadDocument = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const { docType } = req.body;

  if (!req.file) {
    throw new AppError(status.BAD_REQUEST, "No file uploaded");
  }

  // Cloudinary file upload result
  const file = req.file as Express.Multer.File & {
    path?: string;
    filename?: string;
    [key: string]: unknown;
  };

  const fileUrl =
    (file.path as string) ||
    ((file as Record<string, unknown>).location as string);
  const publicId =
    (file.filename as string) ||
    ((file as Record<string, unknown>).public_id as string) ||
    null;

  if (!fileUrl) {
    throw new AppError(status.BAD_REQUEST, "File upload failed");
  }

  const result = await EkycService.uploadDocument(
    user.userId,
    docType,
    fileUrl,
    publicId || null,
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Document uploaded successfully",
    data: result,
  });
});

// Customer: remove my document
const removeDocument = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await EkycService.removeDocument(
    param(req, "documentId"),
    user.userId,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Document removed",
    data: result,
  });
});

// Admin: list all eKYC records
const listEkyc = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const query =
    (req as unknown as Record<string, unknown>).validatedQuery ?? req.query;
  const result = await EkycService.listEkyc(query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "eKYC records retrieved",
    data: result.data,
    meta: result.meta,
  });
});

// Admin: get eKYC by ID
const getEkycById = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await EkycService.getEkycById(param(req, "id"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "eKYC record retrieved",
    data: result,
  });
});

// Admin: get eKYC by user ID
const getEkycByUserId = catchAsync(async (req: Request, res: Response) => {
  ensureUser(req);
  const result = await EkycService.getEkycByUserId(param(req, "userId"));
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "eKYC record retrieved",
    data: result,
  });
});

// Admin: verify or reject eKYC
const updateEkycStatus = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await EkycService.updateEkycStatus(
    param(req, "id"),
    req.body,
    user.userId,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `eKYC ${req.body.status.toLowerCase()} successfully`,
    data: result,
  });
});

export const EkycController = {
  getMyEkyc,
  uploadDocument,
  removeDocument,
  listEkyc,
  getEkycById,
  getEkycByUserId,
  updateEkycStatus,
};

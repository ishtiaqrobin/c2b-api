import status from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AdminService } from "./admin.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const promoteToStaff = catchAsync(async (req: Request, res: Response) => {
  const acting = ensureUser(req);
  const result = await AdminService.promoteToStaff(req.body, acting.userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User promoted to staff successfully",
    data: result,
  });
});

const assignRole = catchAsync(async (req: Request, res: Response) => {
  const acting = ensureUser(req);
  const result = await AdminService.assignRole(
    req.params.userId as string,
    req.body,
    acting.userId,
  );
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Role assigned successfully",
    data: result,
  });
});

const revokeRole = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.revokeRole(req.params.userRoleId as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Role revoked successfully",
    data: result,
  });
});

const listUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.listUsers({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    search: req.query.search as string | undefined,
    userType: req.query.userType as "CUSTOMER" | "STAFF" | undefined,
    isDeleted:
      req.query.isDeleted === undefined
        ? undefined
        : req.query.isDeleted === "true",
  });
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const acting = ensureUser(req);
  const result = await AdminService.softDeleteUser(
    req.params.userId as string,
    acting.userId,
    req.ip, // pass client IP for the audit trail
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User soft-deleted successfully",
    data: result,
  });
});

const restoreUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.restoreUser(req.params.userId as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User restored successfully",
    data: result,
  });
});

const reviewEkyc = catchAsync(async (req: Request, res: Response) => {
  const acting = ensureUser(req);
  const result = await AdminService.reviewEkyc(
    req.params.userId as string,
    req.body,
    acting.userId,
    req.ip,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "eKYC reviewed successfully",
    data: result,
  });
});

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAuditLogs(
    req.query.page ? Number(req.query.page) : 1,
    req.query.limit ? Number(req.query.limit) : 20,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Audit logs fetched successfully",
    data: result,
  });
});

export const AdminController = {
  promoteToStaff,
  assignRole,
  revokeRole,
  listUsers,
  softDeleteUser,
  restoreUser,
  reviewEkyc,
  getAuditLogs,
};

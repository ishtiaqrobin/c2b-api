import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AddressService } from "./address.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

const param = (req: Request, key: string) => req.params[key] as string;

// Customer: get my addresses
const getMyAddresses = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await AddressService.getMyAddresses(user.userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Addresses retrieved",
    data: result,
  });
});

// Customer: get single address
const getAddressById = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await AddressService.getAddressById(
    param(req, "id"),
    user.userId,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Address retrieved",
    data: result,
  });
});

// Customer: create address
const createAddress = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await AddressService.createAddress(user.userId, req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Address created",
    data: result,
  });
});

// Customer: update address
const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await AddressService.updateAddress(
    param(req, "id"),
    user.userId,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Address updated",
    data: result,
  });
});

// Customer: delete address (soft delete)
const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  await AddressService.deleteAddress(param(req, "id"), user.userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Address deleted",
    data: null,
  });
});

// Customer: set default address
const setDefaultAddress = catchAsync(async (req: Request, res: Response) => {
  const user = ensureUser(req);
  const result = await AddressService.setDefaultAddress(
    param(req, "id"),
    user.userId,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Default address updated",
    data: result,
  });
});

// Public/Shared: list districts
const listDistricts = catchAsync(async (req: Request, res: Response) => {
  const query =
    (req as unknown as Record<string, unknown>).validatedQuery ?? req.query;
  const result = await AddressService.listDistricts(query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Districts retrieved",
    data: result.data,
    meta: result.meta,
  });
});

// Public/Shared: list divisions
const listDivisions = catchAsync(async (req: Request, res: Response) => {
  const result = await AddressService.listDivisions();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Divisions retrieved",
    data: result,
  });
});

// Public/Shared: get districts by division
const getDistrictsByDivision = catchAsync(
  async (req: Request, res: Response) => {
    const divisionId = parseInt(param(req, "divisionId"), 10);
    const result = await AddressService.getDistrictsByDivision(divisionId);
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Districts retrieved",
      data: result,
    });
  },
);

export const AddressController = {
  getMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  listDistricts,
  listDivisions,
  getDistrictsByDivision,
};

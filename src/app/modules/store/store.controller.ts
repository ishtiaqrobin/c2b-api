import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StoreService } from "./store.service";

// ==================== STORE ====================

const createStore = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.createStore(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Store created successfully",
    data: result,
  });
});

const getStoreById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await StoreService.getStoreById(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Store retrieved successfully",
    data: result,
  });
});

const getStoreBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const result = await StoreService.getStoreBySlug(slug as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Store retrieved successfully",
    data: result,
  });
});

const listStores = catchAsync(async (req: Request, res: Response) => {
  const result = await StoreService.listStores(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Stores retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateStore = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await StoreService.updateStore(id as string, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Store updated successfully",
    data: result,
  });
});

const deleteStore = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await StoreService.deleteStore(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Store deleted successfully",
    data: result,
  });
});

export const StoreController = {
  createStore,
  getStoreById,
  getStoreBySlug,
  listStores,
  updateStore,
  deleteStore,
};

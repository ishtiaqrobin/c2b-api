import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CheckItemService } from "./checkItem.service";

const createCheckItem = catchAsync(async (req: Request, res: Response) => {
  const result = await CheckItemService.createCheckItem(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Check item created successfully",
    data: result,
  });
});

const getCheckItemById = catchAsync(async (req: Request, res: Response) => {
  const result = await CheckItemService.getCheckItemById(req.params.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Check item retrieved successfully",
    data: result,
  });
});

const getCheckItemsByCategoryId = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CheckItemService.getCheckItemsByCategoryId(
      req.params.categoryId,
    );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Check items retrieved successfully",
      data: result,
    });
  },
);

const listCheckItems = catchAsync(async (req: Request, res: Response) => {
  const result = await CheckItemService.listCheckItems(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Check items retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateCheckItem = catchAsync(async (req: Request, res: Response) => {
  const result = await CheckItemService.updateCheckItem(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Check item updated successfully",
    data: result,
  });
});

const deleteCheckItem = catchAsync(async (req: Request, res: Response) => {
  const result = await CheckItemService.deleteCheckItem(req.params.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Check item deleted successfully",
    data: result,
  });
});

export const CheckItemController = {
  createCheckItem,
  getCheckItemById,
  getCheckItemsByCategoryId,
  listCheckItems,
  updateCheckItem,
  deleteCheckItem,
};

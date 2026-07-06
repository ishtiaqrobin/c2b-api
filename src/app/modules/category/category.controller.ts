import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CategoryService } from "./category.service";

// ==================== CATEGORY ====================

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoryById(req.params.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoryBySlug(
    req.params.slug as string,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

const listCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.listCategories(req.query);
  //   console.log("Meta data : ", result.meta);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Categories retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateCategory(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.deleteCategory(req.params.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

// ==================== CATEGORY NOTICE ====================

const createNotice = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createNotice(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Category notice created successfully",
    data: result,
  });
});

const getNoticeByCategoryId = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CategoryService.getNoticeByCategoryId(
      req.params.categoryId as string,
    );
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Category notice retrieved successfully",
      data: result,
    });
  },
);

const updateNotice = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateNotice(
    req.params.categoryId as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category notice updated successfully",
    data: result,
  });
});

const deleteNotice = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.deleteNotice(
    req.params.categoryId as string,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category notice deleted successfully",
    data: result,
  });
});

// ==================== TREE (public) ====================

const getCategoryTree = catchAsync(async (_req: Request, res: Response) => {
  const result = await CategoryService.getCategoryTree();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Category tree retrieved successfully",
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  updateCategory,
  deleteCategory,
  createNotice,
  getNoticeByCategoryId,
  updateNotice,
  deleteNotice,
  getCategoryTree,
};

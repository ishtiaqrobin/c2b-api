import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProductService } from "./product.service";
import AppError from "../../errorHelpers/AppError";

const ensureUser = (req: Request) => {
  if (!req.user)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!");
  return req.user;
};

// ==================== PRODUCT ====================

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.createProduct(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ProductService.getProductById(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const result = await ProductService.getProductBySlug(slug as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const listProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.listProducts(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ProductService.updateProduct(id as string, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ProductService.deleteProduct(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

// ==================== VARIANT ====================

const createVariant = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.productId;
  const result = await ProductService.createVariant(id as string, req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Variant created successfully",
    data: result,
  });
});

const getVariantById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ProductService.getVariantById(id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Variant retrieved successfully",
    data: result,
  });
});

const listVariants = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.listVariants(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Variants retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateVariant = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ProductService.updateVariant(id as string, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Variant updated successfully",
    data: result,
  });
});

const deleteVariant = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.deleteVariant(req.params.id as string);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Variant deleted successfully",
    data: result,
  });
});

// ==================== DEDUCTION ====================

const createDeduction = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.createDeduction(
    req.params.variantId as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Deduction created successfully",
    data: result,
  });
});

const updateDeduction = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.updateDeduction(
    req.params.deductionId as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Deduction updated successfully",
    data: result,
  });
});

const deleteDeduction = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.deleteDeduction(
    req.params.deductionId as string,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Deduction deleted successfully",
    data: result,
  });
});

// ==================== PRICE ====================

const updatePrice = catchAsync(async (req: Request, res: Response) => {
  const acting = ensureUser(req);
  const result = await ProductService.updatePrice(
    req.params.variantId as string,
    req.body,
    acting.userId,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Price updated successfully",
    data: result,
  });
});

const getPriceHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getPriceHistory(
    req.params.variantId as string,
    req.query.page ? Number(req.query.page) : 1,
    req.query.limit ? Number(req.query.limit) : 20,
  );
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Price history retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const ProductController = {
  createProduct,
  getProductById,
  getProductBySlug,
  listProducts,
  updateProduct,
  deleteProduct,
  createVariant,
  getVariantById,
  listVariants,
  updateVariant,
  deleteVariant,
  createDeduction,
  updateDeduction,
  deleteDeduction,
  updatePrice,
  getPriceHistory,
};

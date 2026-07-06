import { Router } from "express";
import { CategoryController } from "./category.controller";
import {
  validateRequest,
  validateQuery,
} from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import {
  createCategoryZodSchema,
  updateCategoryZodSchema,
  listCategoryQueryZodSchema,
  createNoticeZodSchema,
  updateNoticeZodSchema,
} from "./category.validation";

const router = Router();

// ==================== PUBLIC ROUTES ====================

// Tree (nested hierarchy)
router.get("/tree", CategoryController.getCategoryTree);

// List (with filters + pagination)
router.get(
  "/",
  validateQuery(listCategoryQueryZodSchema),
  CategoryController.listCategories,
);

// Get by slug
router.get("/slug/:slug", CategoryController.getCategoryBySlug);

// Get by ID
router.get("/:id", CategoryController.getCategoryById);

// ==================== ADMIN ROUTES (protected) ====================

// Create category
router.post(
  "/",
  checkAuth,
  requirePermission("category.manage"),
  validateRequest(createCategoryZodSchema),
  CategoryController.createCategory,
);

// Update category
router.patch(
  "/:id",
  checkAuth,
  requirePermission("category.manage"),
  validateRequest(updateCategoryZodSchema),
  CategoryController.updateCategory,
);

// Soft delete category
router.delete(
  "/:id",
  checkAuth,
  requirePermission("category.manage"),
  CategoryController.deleteCategory,
);

// ==================== CATEGORY NOTICE (admin) ====================

// Create notice
router.post(
  "/notices",
  checkAuth,
  requirePermission("category.manage"),
  validateRequest(createNoticeZodSchema),
  CategoryController.createNotice,
);

// Get notice by category ID
router.get("/:categoryId/notice", CategoryController.getNoticeByCategoryId);

// Update notice
router.patch(
  "/:categoryId/notice",
  checkAuth,
  requirePermission("category.manage"),
  validateRequest(updateNoticeZodSchema),
  CategoryController.updateNotice,
);

// Delete notice
router.delete(
  "/:categoryId/notice",
  checkAuth,
  requirePermission("category.manage"),
  CategoryController.deleteNotice,
);

export const CategoryRoutes = router;

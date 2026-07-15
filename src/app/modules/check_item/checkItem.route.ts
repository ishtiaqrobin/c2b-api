import { Router } from "express";
import { CheckItemController } from "./checkItem.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import {
  createCheckItemZodSchema,
  updateCheckItemZodSchema,
} from "./checkItem.validation";

const router = Router();

// Public: get check items by category
router.get(
  "/category/:categoryId",
  CheckItemController.getCheckItemsByCategoryId,
);

// Admin: list all check items
router.get(
  "/",
  checkAuth,
  requirePermission("category.manage"),
  CheckItemController.listCheckItems,
);

// Admin: get single check item
router.get(
  "/:id",
  checkAuth,
  requirePermission("category.manage"),
  CheckItemController.getCheckItemById,
);

// Admin: create check item
router.post(
  "/",
  checkAuth,
  requirePermission("category.manage"),
  validateRequest(createCheckItemZodSchema),
  CheckItemController.createCheckItem,
);

// Admin: update check item
router.patch(
  "/:id",
  checkAuth,
  requirePermission("category.manage"),
  validateRequest(updateCheckItemZodSchema),
  CheckItemController.updateCheckItem,
);

// Admin: delete check item
router.delete(
  "/:id",
  checkAuth,
  requirePermission("category.manage"),
  CheckItemController.deleteCheckItem,
);

export const CheckItemRoutes = router;

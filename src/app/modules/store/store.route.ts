import { Router } from "express";
import { StoreController } from "./store.controller";
import {
  validateRequest,
  validateQuery,
} from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import {
  createStoreZodSchema,
  updateStoreZodSchema,
  listStoreQueryZodSchema,
} from "./store.validation";

const router = Router();

// ==================== PUBLIC ROUTES ====================

// List stores (with filters + pagination)
router.get(
  "/",
  validateQuery(listStoreQueryZodSchema),
  StoreController.listStores,
);

// Get by slug
router.get("/slug/:slug", StoreController.getStoreBySlug);

// Get by ID
router.get("/:id", StoreController.getStoreById);

// ==================== ADMIN ROUTES (protected) ====================

// Create store
router.post(
  "/",
  checkAuth,
  requirePermission("store.manage"),
  validateRequest(createStoreZodSchema),
  StoreController.createStore,
);

// Update store
router.patch(
  "/:id",
  checkAuth,
  requirePermission("store.manage"),
  validateRequest(updateStoreZodSchema),
  StoreController.updateStore,
);

// Soft delete store
router.delete(
  "/:id",
  checkAuth,
  requirePermission("store.manage"),
  StoreController.deleteStore,
);

export const StoreRoutes = router;

import { Router } from "express";
import { CartController } from "./cart.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import { validateRequest } from "../../middleware/validateRequest";
import {
  addItemZodSchema,
  updateItemZodSchema,
  removeItemsZodSchema,
} from "./cart.validation";

const router = Router();

// Customer: get my cart
router.get("/my", checkAuth, CartController.getMyCart);

// Customer: add item to cart
router.post(
  "/items",
  checkAuth,
  validateRequest(addItemZodSchema),
  CartController.addItem,
);

// Customer: update cart item
router.patch(
  "/items/:itemId",
  checkAuth,
  validateRequest(updateItemZodSchema),
  CartController.updateItem,
);

// Customer: remove items from cart
router.delete(
  "/items",
  checkAuth,
  validateRequest(removeItemsZodSchema),
  CartController.removeItems,
);

// Customer: clear cart
router.delete("/my", checkAuth, CartController.clearCart);

// Customer: merge guest cart (after login)
router.post("/merge", checkAuth, CartController.mergeGuestCart);

// Admin: get any cart by ID
router.get(
  "/:id",
  checkAuth,
  requirePermission("cart.manage"),
  CartController.getCartById,
);

// Admin: cleanup expired items
router.delete(
  "/cleanup/expired",
  checkAuth,
  requirePermission("cart.manage"),
  CartController.cleanupExpired,
);

export const CartRoutes = router;

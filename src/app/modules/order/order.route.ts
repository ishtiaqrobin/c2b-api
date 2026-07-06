import { Router } from "express";
import { OrderController } from "./order.controller";
import {
  validateRequest,
  validateQuery,
} from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import {
  createOrderZodSchema,
  updateOrderStatusZodSchema,
  listOrderQueryZodSchema,
  updateTrackingZodSchema,
} from "./order.validation";

const router = Router();

// All order routes require authentication
router.use(checkAuth);

// ==================== CUSTOMER / ADMIN SHARED ====================

// List orders (customer sees own, admin sees all)
router.get(
  "/",
  validateQuery(listOrderQueryZodSchema),
  OrderController.listOrders,
);

// Get order by order number
router.get("/number/:orderNumber", OrderController.getOrderByOrderNumber);

// Get order by ID
router.get("/:id", OrderController.getOrderById);

// ==================== CUSTOMER ====================

// Create order
router.post(
  "/",
  validateRequest(createOrderZodSchema),
  OrderController.createOrder,
);

// Cancel own order
router.patch("/:id/cancel", OrderController.cancelOrder);

// ==================== ADMIN ONLY ====================

// Update order status
router.patch(
  "/:id/status",
  requirePermission("order.update"),
  validateRequest(updateOrderStatusZodSchema),
  OrderController.updateOrderStatus,
);

// Update tracking number (mail-in orders)
router.patch(
  "/:id/tracking",
  requirePermission("order.update"),
  validateRequest(updateTrackingZodSchema),
  OrderController.updateTrackingNumber,
);

export const OrderRoutes = router;

import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import {
  validateQuery,
  validateRequest,
} from "../../middleware/validateRequest";
import {
  updatePaymentZodSchema,
  listPaymentQueryZodSchema,
} from "./payment.validation";

const router = Router();

// Admin: list all payments
router.get(
  "/",
  checkAuth,
  requirePermission("payment.manage"),
  validateQuery(listPaymentQueryZodSchema),
  PaymentController.listPayments,
);

// Admin: get payment by ID
router.get(
  "/:id",
  checkAuth,
  requirePermission("payment.manage"),
  PaymentController.getPaymentById,
);

// Admin: get payment by order ID
router.get(
  "/order/:orderId",
  checkAuth,
  requirePermission("payment.manage"),
  PaymentController.getPaymentByOrderId,
);

// Admin: update payment status
router.patch(
  "/:id",
  checkAuth,
  requirePermission("payment.manage"),
  validateRequest(updatePaymentZodSchema),
  PaymentController.updatePayment,
);

export const PaymentRoutes = router;

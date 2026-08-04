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

// Customer: list own orders' payments
router.get("/my", checkAuth, PaymentController.listMyPayments);

// Admin: get payment by ID
router.get(
  "/:id",
  checkAuth,
  requirePermission("payment.manage"),
  PaymentController.getPaymentById,
);

// Invoice download — staff (invoice.manage) or the owning customer (PAID only).
// Access is enforced inside the service, so this route only needs checkAuth.
router.get(
  "/:id/invoice",
  checkAuth,
  PaymentController.getInvoice,
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

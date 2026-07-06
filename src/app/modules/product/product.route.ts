import { Router } from "express";
import { ProductController } from "./product.controller";
import {
  validateRequest,
  validateQuery,
} from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import {
  createProductZodSchema,
  updateProductZodSchema,
  listProductQueryZodSchema,
  createVariantZodSchema,
  updateVariantZodSchema,
  listVariantQueryZodSchema,
  createDeductionZodSchema,
  updateDeductionZodSchema,
  updatePriceZodSchema,
} from "./product.validation";

const router = Router();

// ==================== PRODUCT (PUBLIC) ====================

router.get(
  "/",
  validateQuery(listProductQueryZodSchema),
  ProductController.listProducts,
);

router.get("/slug/:slug", ProductController.getProductBySlug);

// ==================== VARIANT (PUBLIC) ====================
// NOTE: These must come BEFORE "/:id" below, otherwise Express will match
// "/variants" and "/variants/:id" as if "variants" were a product :id.

router.get(
  "/variants",
  validateQuery(listVariantQueryZodSchema),
  ProductController.listVariants,
);

router.get("/variants/:id", ProductController.getVariantById);

router.get("/:id", ProductController.getProductById);

// ==================== PRODUCT (ADMIN) ====================

router.post(
  "/",
  checkAuth,
  requirePermission("product.manage"),
  validateRequest(createProductZodSchema),
  ProductController.createProduct,
);

router.patch(
  "/:id",
  checkAuth,
  requirePermission("product.manage"),
  validateRequest(updateProductZodSchema),
  ProductController.updateProduct,
);

router.delete(
  "/:id",
  checkAuth,
  requirePermission("product.manage"),
  ProductController.deleteProduct,
);

// ==================== VARIANT (ADMIN) ====================

router.post(
  "/:productId/variants",
  checkAuth,
  requirePermission("variant.manage"),
  validateRequest(createVariantZodSchema),
  ProductController.createVariant,
);

router.patch(
  "/variants/:id",
  checkAuth,
  requirePermission("variant.manage"),
  validateRequest(updateVariantZodSchema),
  ProductController.updateVariant,
);

router.delete(
  "/variants/:id",
  checkAuth,
  requirePermission("variant.manage"),
  ProductController.deleteVariant,
);

// ==================== DEDUCTION (ADMIN) ====================

router.post(
  "/variants/:variantId/deductions",
  checkAuth,
  requirePermission("deduction.manage"),
  validateRequest(createDeductionZodSchema),
  ProductController.createDeduction,
);

router.patch(
  "/deductions/:deductionId",
  checkAuth,
  requirePermission("deduction.manage"),
  validateRequest(updateDeductionZodSchema),
  ProductController.updateDeduction,
);

router.delete(
  "/deductions/:deductionId",
  checkAuth,
  requirePermission("deduction.manage"),
  ProductController.deleteDeduction,
);

// ==================== PRICE (ADMIN) ====================

router.patch(
  "/variants/:variantId/price",
  checkAuth,
  requirePermission("price.manage"),
  validateRequest(updatePriceZodSchema),
  ProductController.updatePrice,
);

router.get(
  "/variants/:variantId/price-history",
  checkAuth,
  requirePermission("price.manage"),
  ProductController.getPriceHistory,
);

export const ProductRoutes = router;

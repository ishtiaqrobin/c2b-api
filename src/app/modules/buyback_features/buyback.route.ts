import { Router } from "express";
import { BuybackFeatureController } from "./buyback.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import {
  validateRequest,
  validateQuery,
} from "../../middleware/validateRequest";
import { multerUpload } from "../../config/multer.config";
import {
  createBuybackFeatureZodSchema,
  updateBuybackFeatureZodSchema,
  listBuybackFeatureQueryZodSchema,
} from "./buyback.validation";

const router = Router();

router.get(
  "/",
  validateQuery(listBuybackFeatureQueryZodSchema),
  BuybackFeatureController.list,
);

router.get("/:id", BuybackFeatureController.getById);

router.post(
  "/",
  checkAuth,
  requirePermission("buyback_feature.manage"),
  multerUpload("buyback_features").single("image"),
  validateRequest(createBuybackFeatureZodSchema),
  BuybackFeatureController.create,
);

router.patch(
  "/:id",
  checkAuth,
  requirePermission("buyback_feature.manage"),
  multerUpload("buyback_features").single("image"),
  validateRequest(updateBuybackFeatureZodSchema),
  BuybackFeatureController.update,
);

router.delete(
  "/:id",
  checkAuth,
  requirePermission("buyback_feature.manage"),
  BuybackFeatureController.remove,
);

export const BuybackFeatureRoutes = router;

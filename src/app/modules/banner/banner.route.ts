import { Router } from "express";
import { BannerController } from "./banner.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import {
  validateRequest,
  validateQuery,
} from "../../middleware/validateRequest";
import { multerUpload } from "../../config/multer.config";
import {
  createBannerZodSchema,
  updateBannerZodSchema,
  listBannerQueryZodSchema,
} from "./banner.validation";

const router = Router();

// Public: list banners
router.get(
  "/",
  validateQuery(listBannerQueryZodSchema),
  BannerController.listBanners,
);

// Public: get single banner
router.get("/:id", BannerController.getBannerById);

// Admin: create banner
router.post(
  "/",
  checkAuth,
  requirePermission("banner.manage"),
  multerUpload("banners").single("image"),
  validateRequest(createBannerZodSchema),
  BannerController.createBanner,
);

// Admin: update banner
router.patch(
  "/:id",
  checkAuth,
  requirePermission("banner.manage"),
  multerUpload("banners").single("image"),
  validateRequest(updateBannerZodSchema),
  BannerController.updateBanner,
);

// Admin: delete banner
router.delete(
  "/:id",
  checkAuth,
  requirePermission("banner.manage"),
  BannerController.deleteBanner,
);

export const BannerRoutes = router;

import { Router } from "express";
import { SettingsController } from "./settings.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import { validateRequest } from "../../middleware/validateRequest";
import { updateSettingsZodSchema } from "./settings.validation";

const router = Router();

// Public: get settings
router.get("/", SettingsController.getSettings);

// Admin: update settings
router.patch(
  "/",
  checkAuth,
  requirePermission("settings.manage"),
  validateRequest(updateSettingsZodSchema),
  SettingsController.updateSettings,
);

export const SettingsRoutes = router;

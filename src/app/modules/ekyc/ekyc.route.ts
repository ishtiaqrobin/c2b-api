import { Router } from "express";
import { EkycController } from "./ekyc.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import { validateRequest } from "../../middleware/validateRequest";
import { multerUpload } from "../../config/multer.config";
import {
  updateEkycZodSchema,
  uploadDocumentZodSchema,
  listEkycQueryZodSchema,
} from "./ekyc.validation";

const router = Router();

// Customer: get my eKYC status
router.get("/my", checkAuth, EkycController.getMyEkyc);

// Customer: upload document
router.post(
  "/my/documents",
  checkAuth,
  multerUpload("ekyc").single("file"),
  validateRequest(uploadDocumentZodSchema),
  EkycController.uploadDocument,
);

// Customer: remove my document
router.delete(
  "/my/documents/:documentId",
  checkAuth,
  EkycController.removeDocument,
);

// Admin: list all eKYC records
router.get(
  "/",
  checkAuth,
  requirePermission("ekyc.manage"),
  validateRequest(listEkycQueryZodSchema),
  EkycController.listEkyc,
);

// Admin: get eKYC by ID
router.get(
  "/:id",
  checkAuth,
  requirePermission("ekyc.manage"),
  EkycController.getEkycById,
);

// Admin: get eKYC by user ID
router.get(
  "/user/:userId",
  checkAuth,
  requirePermission("ekyc.manage"),
  EkycController.getEkycByUserId,
);

// Admin: verify or reject eKYC
router.patch(
  "/:id/status",
  checkAuth,
  requirePermission("ekyc.manage"),
  validateRequest(updateEkycZodSchema),
  EkycController.updateEkycStatus,
);

export const EkycRoutes = router;

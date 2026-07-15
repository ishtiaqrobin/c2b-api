import { Router } from "express";
import { FaqController } from "./faq.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import {
  validateRequest,
  validateQuery,
} from "../../middleware/validateRequest";
import {
  createFaqZodSchema,
  updateFaqZodSchema,
  listFaqQueryZodSchema,
} from "./faq.validation";

const router = Router();

router.get(
  "/",
  validateQuery(listFaqQueryZodSchema),
  FaqController.listFaqs,
);

router.get("/:id", FaqController.getFaqById);

router.post(
  "/",
  checkAuth,
  requirePermission("faq.manage"),
  validateRequest(createFaqZodSchema),
  FaqController.createFaq,
);

router.patch(
  "/:id",
  checkAuth,
  requirePermission("faq.manage"),
  validateRequest(updateFaqZodSchema),
  FaqController.updateFaq,
);

router.delete(
  "/:id",
  checkAuth,
  requirePermission("faq.manage"),
  FaqController.deleteFaq,
);

export const FaqRoutes = router;

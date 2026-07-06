import { Router } from "express";
import { NewsController } from "./news.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { requirePermission } from "../../middleware/requirePermission";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createNewsZodSchema,
  updateNewsZodSchema,
  listNewsQueryZodSchema,
} from "./news.validation";

const router = Router();

// Public: list news
router.get(
  "/",
  validateRequest(listNewsQueryZodSchema),
  NewsController.listNews,
);

// Public: get single news
router.get("/:id", NewsController.getNewsById);

// Admin: create news
router.post(
  "/",
  checkAuth,
  requirePermission("news.manage"),
  validateRequest(createNewsZodSchema),
  NewsController.createNews,
);

// Admin: update news
router.patch(
  "/:id",
  checkAuth,
  requirePermission("news.manage"),
  validateRequest(updateNewsZodSchema),
  NewsController.updateNews,
);

// Admin: delete news
router.delete(
  "/:id",
  checkAuth,
  requirePermission("news.manage"),
  NewsController.deleteNews,
);

export const NewsRoutes = router;

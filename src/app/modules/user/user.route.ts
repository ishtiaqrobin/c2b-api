import { Router } from "express";
import { UserController } from "./user.controller";
import { AuthController } from "../auth/auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { multerUpload } from "../../config/multer.config";
import {
  updateMyProfileZodSchema,
  updatePayoutInfoZodSchema,
  registerZodSchema,
} from "./user.validation";

const router = Router();

// Public: register a new user (Individual or Corporation).
router.post(
  "/register",
  validateRequest(registerZodSchema),
  AuthController.registerUser,
);

// Authenticated: get the current user's full profile.
router.get("/me", checkAuth, UserController.getMyProfile);

// Authenticated: update own profile (name, avatar, personal/company details,
// admin display name). Accepts both JSON and multipart/form-data with an
// optional `image` file for the avatar.
router.put(
  "/me",
  checkAuth,
  multerUpload("users").single("image"),
  validateRequest(updateMyProfileZodSchema),
  UserController.updateMyProfile,
);

// Authenticated: update own payout info (bank / mobile wallet / cash).
router.patch(
  "/me/payout-info",
  checkAuth,
  validateRequest(updatePayoutInfoZodSchema),
  UserController.updatePayoutInfo,
);

export const UserRoutes = router;
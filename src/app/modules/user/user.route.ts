import { Router } from "express";
import { UserController } from "./user.controller";
import { AuthController } from "../auth/auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { updatePayoutInfoZodSchema, registerZodSchema } from "./user.validation";

const router = Router();

// Public: register a new user (Individual or Corporation).
router.post(
  "/register",
  validateRequest(registerZodSchema),
  AuthController.registerUser,
);

// Authenticated: update own payout info (bank / mobile wallet / cash).
router.patch(
  "/me/payout-info",
  checkAuth,
  validateRequest(updatePayoutInfoZodSchema),
  UserController.updatePayoutInfo,
);

export const UserRoutes = router;
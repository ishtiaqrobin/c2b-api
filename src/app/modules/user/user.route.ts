import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { registerZodSchema } from "./user.validation";

const router = Router();

// Public: self-registration (Individual or Corporation). Always CUSTOMER.
router.post(
  "/register",
  validateRequest(registerZodSchema),
  UserController.register,
);

// Authenticated: current user's profile.
router.get("/me", checkAuth, UserController.getMe);

export const UserRoutes = router;

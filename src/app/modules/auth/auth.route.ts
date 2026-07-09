import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

// Current authenticated user (session-based).
router.get("/me", checkAuth, AuthController.getMe);

// Server-side sign out (revokes better-auth session).
router.post("/logout", checkAuth, AuthController.logout);

router.post("/change-password", checkAuth, AuthController.changePassword);

router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;

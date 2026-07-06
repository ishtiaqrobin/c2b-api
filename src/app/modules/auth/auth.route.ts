import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

// Current authenticated user (session-based).
router.get("/me", checkAuth, AuthController.getMe);

// Server-side sign out (revokes better-auth session).
router.post("/logout", checkAuth, AuthController.logout);

// Google OAuth flow.
router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRoutes = router;

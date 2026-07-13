import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

// Current authenticated user (session-based).
router.post("/login", AuthController.loginUser);
router.get("/me", checkAuth, AuthController.getMe);

router.post("/refresh-token", AuthController.getNewToken);
router.post("/change-password", checkAuth, AuthController.changePassword);

// Server-side sign out (revokes better-auth session).
router.post("/logout", checkAuth, AuthController.logoutUser);

router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;

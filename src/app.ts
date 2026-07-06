import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { IndexRoutes } from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import {
  generalRateLimiter,
  authRateLimiter,
} from "./app/middleware/rateLimiter";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from "cors";
import { env } from "./app/config/env";
import logger from "./app/shared/logger";

const app: Application = express();

// Trust proxy (needed behind reverse proxy / load balancer)
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Logger (pino-http)
app.use(
  pinoHttp({
    logger,
    customLogLevel(_req, res, err) {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    customSuccessMessage(req, res) {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage(req, res) {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
  }),
);

// View engine
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/app/templates"));

// Webhook (raw body — must be before JSON/URL-encoded parsers)
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    logger.info({ event: "webhook_received" }, "Webhook received");
    res.status(200).json({ received: true });
  },
);

// CORS
app.use(
  cors({
    origin: [
      env.FRONTEND_URL,
      env.BETTER_AUTH_URL,
      "http://localhost:5000",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Ensure Origin header is present for better-auth (Postman / curl sends none)
app.use("/api/auth", (req, _res, next) => {
  if (!req.headers.origin) {
    req.headers.origin = env.BETTER_AUTH_URL;
  }
  next();
});

// Auth rate limiter (strict — applied before better-auth handler)
app.use("/api/auth", authRateLimiter);

// better-auth handler
app.use("/api/auth", toNodeHandler(auth));

// General rate limiter (all remaining routes)
app.use(generalRateLimiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use("/api/v1", IndexRoutes);

// Health check
app.get("/", async (_req: Request, res: Response) => {
  res.send("C2B Backend is running");
});

// Error handling
app.use(globalErrorHandler);
app.use(notFound);

export default app;

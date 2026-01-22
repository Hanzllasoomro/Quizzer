import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import routes from "./routes";
import { apiRateLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import { requestLogger } from "./middlewares/requestLogger";
import { config } from "../config";

export const createApp = () => {
  const app = express();

  app.use(requestLogger);
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins.length ? config.corsOrigins : undefined,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(apiRateLimiter);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/v1", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

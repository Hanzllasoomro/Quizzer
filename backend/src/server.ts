import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app";
import { config } from "../config";
import { logger } from "./utils/logger";
import { seedAdmin } from "./services/userService";

const app = createApp();

const start = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info("MongoDB connected");

    await seedAdmin();

    if (!process.env.VERCEL) {
      app.listen(config.port, () => {
        logger.info(`Server running on port ${config.port}`);
      });
    }
  } catch (err) {
    logger.error({ err }, "Startup failure");
    process.exit(1);
  }
};

start();

export default app;

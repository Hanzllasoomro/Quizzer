import { defaultConfig } from "./default";

export const productionConfig = {
  ...defaultConfig,
  corsOrigins: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean)
};

import { defaultConfig } from "./default";
import { productionConfig } from "./production";

export const config =
  (process.env.NODE_ENV || "development") === "production"
    ? productionConfig
    : defaultConfig;

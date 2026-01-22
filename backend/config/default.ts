export const defaultConfig = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/quiz-app",
  corsOrigins: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean),
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
    max: Number(process.env.RATE_LIMIT_MAX || 100)
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "change_me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "change_me",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "5d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d"
  },
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@gmail.com",
    password: process.env.ADMIN_PASSWORD || "admin"
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash-latest"
  },
  oauth: {
    redirectBaseUrl: process.env.OAUTH_REDIRECT_BASE_URL || "http://localhost:5000/api/v1",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID || "",
      appSecret: process.env.FACEBOOK_APP_SECRET || ""
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || ""
    }
  }
};

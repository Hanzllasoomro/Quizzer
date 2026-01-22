import { Router } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  googleStartHandler,
  googleCallbackHandler,
  facebookStartHandler,
  facebookCallbackHandler,
  linkedinStartHandler,
  linkedinCallbackHandler
} from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(5)
  })
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  })
});

router.post("/register", validate(registerSchema), registerHandler);
router.post("/login", validate(loginSchema), loginHandler);
router.post("/refresh", validate(refreshSchema), refreshHandler);
router.post("/logout", authenticate, logoutHandler);

router.get("/google", googleStartHandler);
router.get("/google/callback", googleCallbackHandler);
router.get("/facebook", facebookStartHandler);
router.get("/facebook/callback", facebookCallbackHandler);
router.get("/linkedin", linkedinStartHandler);
router.get("/linkedin/callback", linkedinCallbackHandler);

export default router;

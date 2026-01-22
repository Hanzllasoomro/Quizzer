import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { meHandler } from "../controllers/userController";

const router = Router();
router.get("/me", authenticate, meHandler);
export default router;

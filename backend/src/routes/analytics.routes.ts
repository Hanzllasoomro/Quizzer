import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";
import { testResultsHandler } from "../controllers/analyticsController";

const router = Router();

router.get("/tests/:id/results", authenticate, requireRole("ADMIN", "TEACHER"), testResultsHandler);

export default router;

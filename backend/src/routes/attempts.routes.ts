import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { startAttemptHandler, submitAttemptHandler, listAttemptsHandler } from "../controllers/attemptController";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

const startSchema = z.object({
  body: z.object({
    testId: z.string()
  })
});

const submitSchema = z.object({
  body: z.object({
    answers: z.array(
      z.object({
        questionId: z.string(),
        selectedIndex: z.number().min(0).max(3)
      })
    ),
    status: z.enum(["SUBMITTED", "TIMED_OUT"])
  })
});

router.post("/", authenticate, validate(startSchema), startAttemptHandler);
router.post("/:id/submit", authenticate, validate(submitSchema), submitAttemptHandler);
router.get("/", authenticate, requireRole("ADMIN", "TEACHER"), listAttemptsHandler);

export default router;

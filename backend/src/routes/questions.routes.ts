import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";
import { validate } from "../middlewares/validate";
import { createQuestionHandler, listQuestionsHandler, updateQuestionHandler, deleteQuestionHandler } from "../controllers/questionController";

const router = Router();

const createSchema = z.object({
  body: z.object({
    subject: z.string().min(2),
    text: z.string().min(5),
    options: z.array(z.string().min(1)).length(4),
    correctIndex: z.number().min(0).max(3),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    isBank: z.boolean().optional(),
    testId: z.string().optional()
  })
});

const updateSchema = z.object({
  body: z.object({
    subject: z.string().min(2).optional(),
    text: z.string().min(5).optional(),
    options: z.array(z.string().min(1)).length(4).optional(),
    correctIndex: z.number().min(0).max(3).optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    isBank: z.boolean().optional(),
    testId: z.string().nullable().optional()
  })
});

router.get("/", authenticate, listQuestionsHandler);
router.post("/", authenticate, requireRole("ADMIN", "TEACHER"), validate(createSchema), createQuestionHandler);
router.patch("/:id", authenticate, requireRole("ADMIN", "TEACHER"), validate(updateSchema), updateQuestionHandler);
router.delete("/:id", authenticate, requireRole("ADMIN", "TEACHER"), deleteQuestionHandler);

export default router;

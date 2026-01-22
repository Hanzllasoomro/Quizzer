import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";
import { validate } from "../middlewares/validate";
import { createTestHandler, listTestsHandler, getTestHandler, updateTestHandler, deleteTestHandler } from "../controllers/testController";
import { generateQuestionsHandler, generateQuestionsFromDocumentHandler, approveAiQuestionsHandler } from "../controllers/questionController";
import { upload } from "../middlewares/upload";

const router = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    subject: z.string().min(2),
    durationMinutes: z.number().min(1),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional()
  })
});

const updateSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    subject: z.string().min(2).optional(),
    durationMinutes: z.number().min(1).optional(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional()
  })
});

const generateSchema = z.object({
  body: z.object({
    subject: z.string().min(2),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    count: z.number().min(1).max(100)
  })
});

const approveSchema = z.object({
  body: z.object({
    questionIds: z.array(z.string().min(1))
  })
});

router.get("/", authenticate, listTestsHandler);
router.get("/:id", authenticate, getTestHandler);
router.post("/", authenticate, requireRole("ADMIN", "TEACHER"), validate(createSchema), createTestHandler);
router.patch("/:id", authenticate, requireRole("ADMIN", "TEACHER"), validate(updateSchema), updateTestHandler);
router.post("/:id/generate-questions", authenticate, requireRole("ADMIN", "TEACHER"), validate(generateSchema), generateQuestionsHandler);
router.delete("/:id", authenticate, requireRole("ADMIN", "TEACHER"), deleteTestHandler);
router.post(
  "/:id/ai-questions",
  authenticate,
  requireRole("ADMIN", "TEACHER"),
  upload.single("file"),
  generateQuestionsFromDocumentHandler
);
router.post(
  "/:id/ai-questions/approve",
  authenticate,
  requireRole("ADMIN", "TEACHER"),
  validate(approveSchema),
  approveAiQuestionsHandler
);

export default router;

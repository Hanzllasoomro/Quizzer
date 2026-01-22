import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { AuthRequest } from "../middlewares/auth";
import {
  createQuestionService,
  listQuestionsService,
  updateQuestionService,
  deleteQuestionService,
  generateQuestionsForTest,
  generateQuestionsFromDocument,
  approveQuestionsForTest
} from "../services/questionService";
import { extractTextFromFile } from "../utils/documentParser";
import { generateQuestionsFromText } from "../services/aiQuestionService";
import { ApiError } from "../utils/ApiError";

export const createQuestionHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  let isBank = true;
  if (req.body.isBank !== undefined) {
    isBank = req.body.isBank;
  } else if (req.body.testId) {
    isBank = false;
  }
  const question = await createQuestionService({ ...req.body, isBank, createdBy: req.user!.id });
  return sendResponse(res, 201, question, "Question created");
});

export const listQuestionsHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await listQuestionsService(req.query);
  return sendResponse(res, 200, result.items, "Questions", {
    total: result.total,
    page: result.page,
    limit: result.limit
  });
});

export const updateQuestionHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const question = await updateQuestionService(req.params.id, req.body);
  return sendResponse(res, 200, question, "Question updated");
});

export const deleteQuestionHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  await deleteQuestionService(req.params.id);
  return sendResponse(res, 200, undefined, "Question deleted");
});

export const generateQuestionsHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { subject, difficulty, count } = req.body;
  const items = await generateQuestionsForTest(req.params.id, subject, difficulty, Number(count), req.user!.id);
  return sendResponse(res, 201, items, "Questions generated");
});

export const generateQuestionsFromDocumentHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = (req as any).file;
  if (!file) throw new ApiError(400, "File is required");

  const subject = req.body.subject;
  const easy = Number(req.body.easyCount || 0);
  const medium = Number(req.body.mediumCount || 0);
  const hard = Number(req.body.hardCount || 0);

  if (!subject || easy + medium + hard < 1) {
    throw new ApiError(400, "Invalid subject or counts");
  }

  const text = await extractTextFromFile(file);
  const aiQuestions = await generateQuestionsFromText(subject, text, { easy, medium, hard });

  const result = await generateQuestionsFromDocument(
    req.params.id,
    subject,
    { easy, medium, hard },
    req.user!.id,
    text,
    aiQuestions
  );

  return sendResponse(res, 201, result.created, "AI questions generated (pending approval)");
});

export const approveAiQuestionsHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { questionIds } = req.body;
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw new ApiError(400, "questionIds is required");
  }

  const approvedCount = await approveQuestionsForTest(req.params.id, questionIds);
  return sendResponse(res, 200, { approvedCount }, "Questions approved");
});

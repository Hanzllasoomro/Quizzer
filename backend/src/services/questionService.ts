import { ApiError } from "../utils/ApiError";
import { createQuestion, updateQuestion, deleteQuestion, listQuestions, countQuestions, findBankQuestions } from "../repository/questionRepository";
import { getPagination } from "../utils/pagination";
import { Question } from "../models/Question";
import { Test } from "../models/Test";

export const createQuestionService = async (payload: any) => {
  const question = await createQuestion(payload);
  if (payload.testId && payload.approvalStatus !== "PENDING") {
    await Test.findByIdAndUpdate(payload.testId, { $inc: { totalQuestions: 1 } });
  }
  return question;
};

export const listQuestionsService = async (query: any) => {
  const { page, limit, skip } = getPagination(Number(query.page), Number(query.limit));
  const filter: any = {};
  if (query.subject) filter.subject = query.subject;
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.testId) filter.testId = query.testId;
  if (query.isBank !== undefined) filter.isBank = query.isBank === "true";
  if (query.approvalStatus) filter.approvalStatus = query.approvalStatus;
  const [items, total] = await Promise.all([
    listQuestions(filter, skip, limit),
    countQuestions(filter)
  ]);
  return { items, total, page, limit };
};

export const updateQuestionService = async (id: string, payload: any) => {
  const question = await updateQuestion(id, payload);
  if (!question) throw new ApiError(404, "Question not found");
  return question;
};

export const deleteQuestionService = async (id: string) => {
  const question = await deleteQuestion(id);
  if (!question) throw new ApiError(404, "Question not found");
};

export const generateQuestionsForTest = async (testId: string, subject: string, difficulty: string, count: number, createdBy: string) => {
  const test = await Test.findById(testId);
  if (!test) throw new ApiError(404, "Test not found");

  const bankQuestions = await findBankQuestions(subject, difficulty, count);
  if (bankQuestions.length < count) {
    throw new ApiError(400, "Insufficient questions in bank");
  }

  const created = await Question.insertMany(
    bankQuestions.map((q: any) => ({
      testId,
      subject: q.subject,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      difficulty: q.difficulty,
      isBank: false,
      createdBy
    }))
  );

  await Test.findByIdAndUpdate(testId, {
    $inc: { totalQuestions: created.length }
  });

  return created;
};

export const generateQuestionsFromDocument = async (
  testId: string,
  subject: string,
  counts: { easy: number; medium: number; hard: number },
  createdBy: string,
  text: string,
  aiQuestions: Array<{
    text: string;
    options: string[];
    correctIndex: number;
    difficulty: "EASY" | "MEDIUM" | "HARD";
  }>
) => {
  const test = await Test.findById(testId);
  if (!test) throw new ApiError(404, "Test not found");

  if (!text.trim()) throw new ApiError(400, "Document text is empty");

  const created = await Question.insertMany(
    aiQuestions.map((q) => ({
      testId,
      subject,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      difficulty: q.difficulty,
      isBank: false,
      approvalStatus: "PENDING",
      createdBy
    }))
  );

  return { created, counts };
};

export const approveQuestionsForTest = async (
  testId: string,
  questionIds: string[]
) => {
  const result = await Question.updateMany(
    { _id: { $in: questionIds }, testId, approvalStatus: "PENDING" },
    { $set: { approvalStatus: "APPROVED" } }
  );

  if (result.modifiedCount > 0) {
    await Test.findByIdAndUpdate(testId, {
      $inc: { totalQuestions: result.modifiedCount }
    });
  }

  return result.modifiedCount;
};

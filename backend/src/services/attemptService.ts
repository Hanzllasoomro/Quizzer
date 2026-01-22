import { ApiError } from "../utils/ApiError";
import { createAttempt, findAttemptById, listAttempts, countAttempts, updateAttempt } from "../repository/attemptRepository";
import { getPagination } from "../utils/pagination";
import { IQuestion, Question } from "../models/Question";
import { Test } from "../models/Test";
import { Attempt } from "../models/Attempt";

export const startAttempt = async (userId: string, testId: string) => {
  const test = await Test.findById(testId);
  if (test?.status !== "ACTIVE") {
    throw new ApiError(400, "Test is not available");
  }
  const existing = await Attempt.findOne({ userId, testId, status: "IN_PROGRESS" });
  if (existing) return existing;
  const attempt = await createAttempt({
    userId,
    testId,
    answers: [],
    startedAt: new Date(),
    status: "IN_PROGRESS"
  });
  return attempt;
};

export const submitAttempt = async (
  attemptId: string,
  answers: { questionId: string; selectedIndex: number }[],
  status: "SUBMITTED" | "TIMED_OUT"
) => {
  const attempt = await findAttemptById(attemptId);
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (attempt.status !== "IN_PROGRESS") throw new ApiError(400, "Attempt already submitted");

  const questionIds = answers.map((a) => a.questionId);
  const questions = await Question.find({
    _id: { $in: questionIds },
    testId: attempt.testId
  });
  const map = new Map<string, IQuestion>(questions.map((q: IQuestion) => [q.id, q]));

  let score = 0;
  for (const ans of answers) {
    const q: any = map.get(ans.questionId);
    if (q && q.correctIndex === ans.selectedIndex) score += 1;
  }

  const test = await Test.findById(attempt.testId);

  const updated = await updateAttempt(attemptId, {
    answers,
    submittedAt: new Date(),
    score,
    total: test?.totalQuestions || questions.length,
    status
  });

  return updated;
};

export const listAttemptsService = async (query: any) => {
  const { page, limit, skip } = getPagination(Number(query.page), Number(query.limit));
  const filter: any = {};
  if (query.userId) filter.userId = query.userId;
  if (query.testId) filter.testId = query.testId;
  const [items, total] = await Promise.all([
    listAttempts(filter, skip, limit),
    countAttempts(filter)
  ]);
  return { items, total, page, limit };
};

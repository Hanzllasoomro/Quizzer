import { Question } from "../models/Question";

export const createQuestion = (payload: any) => Question.create(payload);

export const findQuestionById = (id: string) => Question.findById(id);

export const listQuestions = (filter: any, skip: number, limit: number) =>
  Question.find(filter).skip(skip).limit(limit);

export const countQuestions = (filter: any) => Question.countDocuments(filter);

export const updateQuestion = (id: string, payload: any) =>
  Question.findByIdAndUpdate(id, payload, { new: true });

export const deleteQuestion = (id: string) => Question.findByIdAndDelete(id);

export const findBankQuestions = (subject: string, difficulty: string, limit: number) =>
  Question.aggregate([
    {
      $match: {
        subject,
        difficulty,
        isBank: true
      }
    },
    { $sample: { size: limit } }
  ]);

export const findQuestionsByTestId = (testId: string, approvalStatus?: string) => {
  const filter: any = { testId };
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  return Question.find(filter).sort({ createdAt: 1 });
};

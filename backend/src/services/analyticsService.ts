import { Attempt } from "../models/Attempt";

export const getTestResults = async (testId: string) => {
  return Attempt.find({ testId, status: { $ne: "IN_PROGRESS" } })
    .populate("userId", "name email")
    .select("userId score total status submittedAt")
    .sort({ submittedAt: -1 });
};

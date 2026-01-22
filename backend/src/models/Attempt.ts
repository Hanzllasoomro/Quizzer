import { Schema, model, Document, Types } from "mongoose";

export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "TIMED_OUT";

export interface IAnswer {
  questionId: Types.ObjectId;
  selectedIndex: number;
}

export interface IAttempt extends Document {
  userId: Types.ObjectId;
  testId: Types.ObjectId;
  answers: IAnswer[];
  startedAt: Date;
  submittedAt?: Date | null;
  score: number;
  total: number;
  status: AttemptStatus;
  createdAt: Date;
  updatedAt: Date;
}

const attemptSchema = new Schema<IAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    testId: { type: Schema.Types.ObjectId, ref: "Test", required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question" },
        selectedIndex: { type: Number, min: 0, max: 3 }
      }
    ],
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "SUBMITTED", "TIMED_OUT"],
      default: "IN_PROGRESS"
    }
  },
  { timestamps: true }
);

attemptSchema.index({ userId: 1, testId: 1, status: 1 });

export const Attempt = model<IAttempt>("Attempt", attemptSchema);

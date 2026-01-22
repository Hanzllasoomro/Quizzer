import { Schema, model, Document, Types } from "mongoose";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IQuestion extends Document {
  testId?: Types.ObjectId | null;
  subject: string;
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: Difficulty;
  isBank: boolean;
  approvalStatus: ApprovalStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    testId: { type: Schema.Types.ObjectId, ref: "Test", default: null },
    subject: { type: String, required: true, index: true },
    text: { type: String, required: true },
    options: {
      type: [String],
      validate: [
        (v: string[]) => v.length === 4,
        "Options must contain exactly 4 items"
      ],
      required: true
    },
    correctIndex: { type: Number, min: 0, max: 3, required: true },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      required: true,
      index: true
    },
    isBank: { type: Boolean, default: true, index: true },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
      index: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

questionSchema.index({ subject: 1, difficulty: 1, isBank: 1, approvalStatus: 1 });

export const Question = model<IQuestion>("Question", questionSchema);

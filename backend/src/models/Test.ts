import { Schema, model, Document, Types } from "mongoose";

export type TestStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface ITest extends Document {
  title: string;
  subject: string;
  durationMinutes: number;
  status: TestStatus;
  createdBy: Types.ObjectId;
  totalQuestions: number;
  createdAt: Date;
  updatedAt: Date;
}

const testSchema = new Schema<ITest>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true, index: true },
    durationMinutes: { type: Number, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "DRAFT",
      index: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalQuestions: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Test = model<ITest>("Test", testSchema);

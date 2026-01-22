import { Schema, model, Document } from "mongoose";

export type UserRole = "ADMIN" | "TEACHER" | "USER";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "TEACHER", "USER"],
      default: "USER"
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);

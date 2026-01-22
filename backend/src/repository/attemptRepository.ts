import { Attempt } from "../models/Attempt";

export const createAttempt = (payload: any) => Attempt.create(payload);

export const findAttemptById = (id: string) => Attempt.findById(id);

export const listAttempts = (filter: any, skip: number, limit: number) =>
  Attempt.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });

export const countAttempts = (filter: any) => Attempt.countDocuments(filter);

export const updateAttempt = (id: string, payload: any) =>
  Attempt.findByIdAndUpdate(id, payload, { new: true });

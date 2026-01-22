import { Test } from "../models/Test";

export const createTest = (payload: any) => Test.create(payload);

export const findTestById = (id: string) => Test.findById(id);

export const listTests = (filter: any, skip: number, limit: number, sort: any) =>
  Test.find(filter).skip(skip).limit(limit).sort(sort);

export const countTests = (filter: any) => Test.countDocuments(filter);

export const updateTest = (id: string, payload: any) =>
  Test.findByIdAndUpdate(id, payload, { new: true });

export const deleteTest = (id: string) => Test.findByIdAndDelete(id);

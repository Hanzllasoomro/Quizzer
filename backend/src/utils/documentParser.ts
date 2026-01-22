import type { Express } from "express";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { ApiError } from "./ApiError";

const SUPPORTED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);

export const extractTextFromFile = async (file: Express.Multer.File) => {
  if (!SUPPORTED_MIME.has(file.mimetype)) {
    throw new ApiError(400, "Unsupported file type");
  }

  if (file.mimetype === "application/pdf") {
    const data = await pdf(file.buffer);
    return data.text || "";
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value || "";
  }

  return file.buffer.toString("utf-8");
};

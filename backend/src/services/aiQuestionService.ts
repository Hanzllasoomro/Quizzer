import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config";
import { ApiError } from "../utils/ApiError";

export type AiQuestion = {
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: any) => {
  const message = String(error?.message || "");
  return (
    message.includes("503") ||
    message.includes("overloaded") ||
    message.includes("fetch failed")
  );
};

const buildPrompt = (
  subject: string,
  text: string,
  counts: { easy: number; medium: number; hard: number }
) => {
  return `You are an assessment generator. Create multiple choice questions strictly from the provided document.

Subject: ${subject}

Document:
"""
${text}
"""

Return JSON ONLY, with this exact shape:
{
  "questions": [
    {
      "text": "string",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "difficulty": "EASY|MEDIUM|HARD"
    }
  ]
}

Rules:
- Create exactly ${counts.easy} EASY, ${counts.medium} MEDIUM, ${counts.hard} HARD questions.
- Use exactly 4 options per question.
- correctIndex is 0-3.
- Do not include any extra commentary or markdown.
- If the document lacks info, make best effort but stay grounded in the text.
`;
};

export const generateQuestionsFromText = async (
  subject: string,
  text: string,
  counts: { easy: number; medium: number; hard: number }
) => {
  if (!config.gemini.apiKey) {
    throw new ApiError(500, "Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  const model = genAI.getGenerativeModel({ model: config.gemini.model });

  const trimmed = text.slice(0, 12000);
  const prompt = buildPrompt(subject, trimmed, counts);

  let output = "";
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      output = response.text();
      break;
    } catch (error: any) {
      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw new ApiError(503, "AI service temporarily unavailable", { cause: error?.message });
      }
      const delayMs = 500 * attempt * attempt;
      await sleep(delayMs);
    }
  }

  let parsed: any;
  try {
    parsed = JSON.parse(output);
  } catch {
    throw new ApiError(502, "Invalid AI response", { raw: output });
  }

  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new ApiError(502, "Invalid AI response", { raw: output });
  }

  return parsed.questions as AiQuestion[];
};

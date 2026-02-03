import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

type TestSummary = {
  title?: string;
  subject?: string;
  durationMinutes?: number;
};

type QuestionSummary = {
  text: string;
  options: string[];
};

const buildHeader = (test: TestSummary) => {
  const title = test.title?.trim() || "Test Questions";
  const subject = test.subject?.trim();
  const duration = typeof test.durationMinutes === "number" ? `${test.durationMinutes} minutes` : undefined;

  const header: Paragraph[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1
    })
  ];

  const metaParts = [subject ? `Subject: ${subject}` : undefined, duration ? `Duration: ${duration}` : undefined].filter(Boolean);
  if (metaParts.length) {
    header.push(
      new Paragraph({
        children: [new TextRun({ text: metaParts.join(" • "), color: "666666" })]
      })
    );
  }

  header.push(new Paragraph({ text: "" }));

  return header;
};

export const buildQuestionsDocx = async (test: TestSummary, questions: QuestionSummary[]) => {
  const children: Paragraph[] = [...buildHeader(test)];

  questions.forEach((q, index) => {
    const qNumber = index + 1;
    const qText = q.text?.trim() || "(Untitled question)";

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Q${qNumber}. `, bold: true }), new TextRun({ text: qText })]
      })
    );

    q.options?.forEach((opt, optIndex) => {
      const label = String.fromCharCode(65 + optIndex);
      children.push(
        new Paragraph({
          indent: { left: 720 },
          children: [new TextRun({ text: `${label}. ${opt}` })]
        })
      );
    });

    children.push(new Paragraph({ text: "" }));
  });

  const doc = new Document({
    sections: [
      {
        children
      }
    ]
  });

  return Packer.toBuffer(doc);
};

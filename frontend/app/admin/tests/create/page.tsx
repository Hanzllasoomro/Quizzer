"use client";

import { useState } from "react";
import { apiFetch, API_BASE } from "../../../../lib/api";
import { NavBar } from "../../../../components/NavBar";
import { RequireRole } from "../../../../components/RequireRole";
import { useToast } from "../../../../components/ToastProvider";

type ManualQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
};

export default function CreateTestPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [testId, setTestId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [easyCount, setEasyCount] = useState(1);
  const [mediumCount, setMediumCount] = useState(1);
  const [hardCount, setHardCount] = useState(1);
  const [manualQuestions, setManualQuestions] = useState<ManualQuestion[]>([]);
  const { show } = useToast();

  const addManualQuestion = () => {
    setManualQuestions((prev) => [
      ...prev,
      {
        id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
        text: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        difficulty: "EASY"
      }
    ]);
  };

  const updateManualQuestionText = (id: string, value: string) => {
    setManualQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text: value } : q)));
  };

  const updateManualQuestionOption = (id: string, index: number, value: string) => {
    setManualQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const nextOptions = [...q.options];
        nextOptions[index] = value;
        return { ...q, options: nextOptions };
      })
    );
  };

  const removeManualQuestion = (id: string) => {
    setManualQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateManualQuestionCorrect = (id: string, index: number) => {
    setManualQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, correctIndex: index } : q)));
  };

  const updateManualQuestionDifficulty = (id: string, value: "EASY" | "MEDIUM" | "HARD") => {
    setManualQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, difficulty: value } : q)));
  };

  const onCreate = async () => {
    try {
      if (!title.trim() || title.trim().length < 3) {
        throw new Error("Title must be at least 3 characters");
      }
      if (!subject.trim() || subject.trim().length < 2) {
        throw new Error("Subject must be at least 2 characters");
      }
      if (!durationMinutes || durationMinutes < 1) {
        throw new Error("Duration must be at least 1 minute");
      }
      const res = await apiFetch<any>("/tests", {
        method: "POST",
        body: JSON.stringify({ title, subject, durationMinutes, status: "DRAFT" })
      });
      show(`Test created: ${res.data?.title}`, "success");
      if (res.data?._id) {
        setTestId(res.data._id);
      }
      const createdId = res.data?._id as string | undefined;
      if (createdId && manualQuestions.length > 0) {
        await Promise.all(
          manualQuestions.map((q) =>
            apiFetch("/questions", {
              method: "POST",
              body: JSON.stringify({
                subject,
                text: q.text,
                options: q.options,
                correctIndex: q.correctIndex,
                difficulty: q.difficulty,
                testId: createdId,
                isBank: false
              })
            })
          )
        );
        show("Test and questions saved successfully", "success");
      }
    } catch (e: any) {
      show(e.message || "Failed to create test", "error");
    }
  };

  const onPublish = async () => {
    try {
      if (!testId) {
        throw new Error("Create and save the test first");
      }
      await apiFetch(`/tests/${testId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ACTIVE" })
      });
      show("Test published and now active", "success");
    } catch (e: any) {
      show(e.message || "Failed to publish test", "error");
    }
  };

  const onGenerateAI = async () => {
    if (!file) {
      show("Upload a document first", "error");
      return;
    }
    try {
      const token = localStorage.getItem("accessToken") || "";
      if (!testId) throw new Error("Create and save the test first");

      const form = new FormData();
      form.append("file", file);
      form.append("subject", subject);
      form.append("easyCount", String(easyCount));
      form.append("mediumCount", String(mediumCount));
      form.append("hardCount", String(hardCount));

      const res = await fetch(`${API_BASE}/tests/${testId}/ai-questions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }
      if (!res.ok) throw new Error(json?.message || text || "AI generation failed");
      show("AI questions generated (pending approval)", "success");
    } catch (e: any) {
      show(e.message || "AI generation failed", "error");
    }
  };

  return (
    <RequireRole roles={["ADMIN", "TEACHER"]}>
      <div className="page">
        <NavBar />
        <div className="container dashboard">
          <header className="page-header">
            <div>
              <h1>Create Test</h1>
              <p className="muted">Configure the test, generate questions, or add them manually.</p>
            </div>
            <button className="btn btn-ghost" type="button" onClick={() => globalThis.history.back()}>
              Back
            </button>
          </header>

          <div className="card section-card">
            <h2>Test Details</h2>
            <p className="muted">Basic information for the exam.</p>
            <div className="form-grid">
              <div>
                <label className="label" htmlFor="test-title">Title</label>
                <input id="test-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="test-subject">Subject</label>
                <input id="test-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="test-duration">Duration (minutes)</label>
                <input id="test-duration" className="input" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="card section-card">
            <h2>AI Question Generation</h2>
            <p className="muted">Upload a document to generate questions by difficulty.</p>
            <input className="input" type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="form-grid">
              <div>
                <label className="label" htmlFor="ai-easy">Easy</label>
                <input id="ai-easy" className="input" type="number" value={easyCount} onChange={(e) => setEasyCount(Number(e.target.value))} />
              </div>
              <div>
                <label className="label" htmlFor="ai-medium">Medium</label>
                <input id="ai-medium" className="input" type="number" value={mediumCount} onChange={(e) => setMediumCount(Number(e.target.value))} />
              </div>
              <div>
                <label className="label" htmlFor="ai-hard">Hard</label>
                <input id="ai-hard" className="input" type="number" value={hardCount} onChange={(e) => setHardCount(Number(e.target.value))} />
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-outline" onClick={onGenerateAI}>Generate AI Questions</button>
            </div>
          </div>

          <div className="card section-card">
            <div className="section-header-row">
              <div>
                <h2>Manual Question Builder</h2>
                <p className="muted">Add questions manually if needed.</p>
              </div>
              <button className="btn btn-outline" type="button" onClick={addManualQuestion}>
                Add Question
              </button>
            </div>
            {manualQuestions.map((q, idx) => (
              <div key={q.id} className="question-card stack">
                <label className="label">Question {idx + 1}</label>
                <input
                  className="input"
                  value={q.text}
                  onChange={(e) => updateManualQuestionText(q.id, e.target.value)}
                />
                <div className="grid grid-2">
                  {q.options.map((opt, i) => (
                    <input
                      key={`opt-${idx}-${i}`}
                      className="input"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => updateManualQuestionOption(q.id, i, e.target.value)}
                    />
                  ))}
                </div>
                <div className="grid grid-2">
                  <div>
                    <label className="label">Difficulty</label>
                    <select
                      className="input"
                      value={q.difficulty}
                      onChange={(e) => updateManualQuestionDifficulty(q.id, e.target.value as ManualQuestion["difficulty"])}
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Correct Option</label>
                    <select
                      className="input"
                      value={q.correctIndex}
                      onChange={(e) => updateManualQuestionCorrect(q.id, Number(e.target.value))}
                    >
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </div>
                </div>
                <button
                  className="btn btn-danger-outline"
                  type="button"
                  onClick={() => removeManualQuestion(q.id)}
                >
                  Remove Question
                </button>
              </div>
            ))}
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={onCreate}>Save Test</button>
            <button className="btn btn-outline" type="button" onClick={onPublish}>
              Publish Test
            </button>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}

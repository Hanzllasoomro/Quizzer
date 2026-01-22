"use client";

import { useState } from "react";
import { apiFetch, API_BASE } from "../../../../lib/api";
import { NavBar } from "../../../../components/NavBar";
import { RequireRole } from "../../../../components/RequireRole";

export default function CreateTestPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [testId, setTestId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [easyCount, setEasyCount] = useState(1);
  const [mediumCount, setMediumCount] = useState(1);
  const [hardCount, setHardCount] = useState(1);
  const [manualQuestions, setManualQuestions] = useState<
    { id: string; text: string; options: string[]; correctIndex: number; difficulty: "EASY" | "MEDIUM" | "HARD" }[]
  >([]);

  const addManualQuestion = () => {
    setManualQuestions((prev) => [
      ...prev,
      { id: globalThis.crypto?.randomUUID?.() || String(Date.now()), text: "", options: ["", "", "", ""], correctIndex: 0, difficulty: "EASY" }
    ]);
  };

  const updateManualQuestionText = (id: string, value: string) => {
    setManualQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text: value } : q))
    );
  };

  const updateManualQuestionOption = (id: string, index: number, value: string) => {
    setManualQuestions((prev) => {
      return prev.map((q) => {
        if (q.id !== id) return q;
        const nextOptions = [...q.options];
        nextOptions[index] = value;
        return { ...q, options: nextOptions };
      });
    });
  };

  const removeManualQuestion = (id: string) => {
    setManualQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateManualQuestionCorrect = (id: string, index: number) => {
    setManualQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, correctIndex: index } : q))
    );
  };

  const updateManualQuestionDifficulty = (id: string, value: "EASY" | "MEDIUM" | "HARD") => {
    setManualQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, difficulty: value } : q))
    );
  };

  const onCreate = async () => {
    setError("");
    setMessage("");
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
      setMessage(`Test created: ${res.data?.title}`);
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
        setMessage("Test and questions saved successfully");
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const onPublish = async () => {
    setError("");
    setMessage("");
    try {
      if (!testId) {
        throw new Error("Create and save the test first");
      }
      await apiFetch(`/tests/${testId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "ACTIVE" })
      });
      setMessage("Test published and now active");
    } catch (e: any) {
      setError(e.message);
    }
  };

  const onGenerateAI = async () => {
    setError("");
    setMessage("");
    if (!file) {
      setError("Upload a document first");
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
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "AI generation failed");
      setMessage("AI questions generated (pending approval)");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <RequireRole roles={["ADMIN", "TEACHER"]}>
      <div className="container">
        <NavBar />
      <div className="inline" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div className="page-title">Create Test</div>
          <p className="muted">Configure the test and add questions</p>
        </div>
        <button className="btn btn-outline" type="button" onClick={() => globalThis.history.back()}>
          Back
        </button>
      </div>

      <div className="card stack">
        <h3>Test Details</h3>
        <p className="muted">Fill in the basic information for this test.</p>
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
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
      </div>

      <div className="card stack" style={{ marginTop: 16 }}>
        <h3>AI Question Generation</h3>
        <p className="muted">Upload a document to generate questions by difficulty.</p>
        <input className="input" type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div className="grid grid-3">
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
        <button className="btn btn-outline" onClick={onGenerateAI}>Generate AI Questions</button>
      </div>

      <div className="card stack" style={{ marginTop: 16 }}>
        <h3>Manual Question Builder</h3>
        <p className="muted">Add questions manually if needed.</p>
        <div className="actions">
          <button
            className="btn btn-outline"
            type="button"
            onClick={addManualQuestion}
          >
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
                  onChange={(e) => updateManualQuestionDifficulty(q.id, e.target.value as any)}
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
              className="btn btn-outline"
              type="button"
              onClick={() => removeManualQuestion(q.id)}
            >
              Remove Question
            </button>
          </div>
        ))}
      </div>

      <div className="card stack" style={{ marginTop: 16 }}>
        <h3>Finalize</h3>
        <p className="muted">Save or publish after completing all questions.</p>
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

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../../lib/api";
import { NavBar } from "../../../../components/NavBar";
import { RequireRole } from "../../../../components/RequireRole";
import { useToast } from "../../../../components/ToastProvider";

export default function ManageTestPage() {
  const params = useParams();
  const id = params?.id as string;
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "ARCHIVED">("DRAFT");
  const [questions, setQuestions] = useState<any[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    difficulty: "EASY"
  });
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    difficulty: "EASY"
  });
  const [bankGenerate, setBankGenerate] = useState({
    subject: "",
    difficulty: "EASY",
    count: 1
  });
  const { show } = useToast();

  useEffect(() => {
    if (!id) return;
    apiFetch<any>(`/tests/${id}`)
      .then((res) => {
        setTitle(res.data?.title || "");
        setSubject(res.data?.subject || "");
        setDurationMinutes(res.data?.durationMinutes || 30);
        setStatus(res.data?.status || "DRAFT");
        setBankGenerate((prev) => ({ ...prev, subject: res.data?.subject || "" }));
      })
      .catch((e: any) => show(e.message || "Failed to load test", "error"));
  }, [id, show]);

  const loadQuestions = async () => {
    if (!id) return;
    const list = await apiFetch<any[]>(`/questions?testId=${id}&approvalStatus=APPROVED`);
    const pending = await apiFetch<any[]>(`/questions?testId=${id}&approvalStatus=PENDING`);
    setQuestions(list.data || []);
    setPendingQuestions(pending.data || []);
  };

  useEffect(() => {
    loadQuestions().catch(() => undefined);
  }, [id]);

  const onSave = async () => {
    try {
      await apiFetch(`/tests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, subject, durationMinutes, status })
      });
      show("Test updated successfully", "success");
    } catch (e: any) {
      show(e.message || "Failed to update test", "error");
    }
  };

  const onDelete = async () => {
    if (!globalThis.confirm("Delete this test?")) return;
    try {
      await apiFetch(`/tests/${id}`, { method: "DELETE" });
      show("Test deleted successfully", "success");
      globalThis.location.href = "/admin/dashboard";
    } catch (e: any) {
      show(e.message || "Failed to delete test", "error");
    }
  };

  const onAddQuestion = async () => {
    try {
      await apiFetch("/questions", {
        method: "POST",
        body: JSON.stringify({
          subject,
          text: newQuestion.text,
          options: newQuestion.options,
          correctIndex: newQuestion.correctIndex,
          difficulty: newQuestion.difficulty,
          testId: id,
          isBank: false
        })
      });
      show("Question added", "success");
      setNewQuestion({ text: "", options: ["", "", "", ""], correctIndex: 0, difficulty: "EASY" });
      await loadQuestions();
    } catch (e: any) {
      show(e.message || "Failed to add question", "error");
    }
  };

  const onDeleteQuestion = async (questionId: string) => {
    try {
      await apiFetch(`/questions/${questionId}`, { method: "DELETE" });
      show("Question deleted", "success");
      await loadQuestions();
    } catch (e: any) {
      show(e.message || "Failed to delete question", "error");
    }
  };

  const onGenerateFromBank = async () => {
    try {
      await apiFetch(`/tests/${id}/generate-questions`, {
        method: "POST",
        body: JSON.stringify({
          subject: bankGenerate.subject || subject,
          difficulty: bankGenerate.difficulty,
          count: bankGenerate.count
        })
      });
      show("Questions generated from bank", "success");
      await loadQuestions();
    } catch (e: any) {
      show(e.message || "Failed to generate questions", "error");
    }
  };

  const onStartEditQuestion = (q: any) => {
    setEditingQuestionId(q._id);
    setEditQuestion({
      text: q.text || "",
      options: Array.isArray(q.options) && q.options.length === 4 ? [...q.options] : ["", "", "", ""],
      correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
      difficulty: q.difficulty || "EASY"
    });
  };

  const onCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditQuestion({ text: "", options: ["", "", "", ""], correctIndex: 0, difficulty: "EASY" });
  };

  const onSaveEditQuestion = async () => {
    if (!editingQuestionId) return;
    try {
      await apiFetch(`/questions/${editingQuestionId}`, {
        method: "PATCH",
        body: JSON.stringify({
          text: editQuestion.text,
          options: editQuestion.options,
          correctIndex: editQuestion.correctIndex,
          difficulty: editQuestion.difficulty
        })
      });
      show("Question updated", "success");
      setEditingQuestionId(null);
      await loadQuestions();
    } catch (e: any) {
      show(e.message || "Failed to update question", "error");
    }
  };

  const onApprovePending = async () => {
    if (!pendingQuestions.length) return;
    try {
      await apiFetch(`/tests/${id}/ai-questions/approve`, {
        method: "POST",
        body: JSON.stringify({ questionIds: pendingQuestions.map((q) => q._id) })
      });
      show("Pending AI questions approved", "success");
      await loadQuestions();
    } catch (e: any) {
      show(e.message || "Failed to approve questions", "error");
    }
  };

  const onApproveQuestion = async (questionId: string) => {
    try {
      await apiFetch(`/tests/${id}/ai-questions/approve`, {
        method: "POST",
        body: JSON.stringify({ questionIds: [questionId] })
      });
      show("Question approved", "success");
      await loadQuestions();
    } catch (e: any) {
      show(e.message || "Failed to approve question", "error");
    }
  };

  return (
    <RequireRole roles={["ADMIN", "TEACHER"]}>
      <div className="page">
        <NavBar />
        <div className="container dashboard">
          <header className="page-header">
            <div>
              <h1>Manage Test</h1>
              <p className="muted">Update test details, questions, and approvals.</p>
            </div>
            <button className="btn btn-ghost" type="button" onClick={() => globalThis.history.back()}>
              Back
            </button>
          </header>

          <div className="card section-card">
          <div>
            <label className="label" htmlFor="manage-title">Title</label>
            <input id="manage-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="manage-subject">Subject</label>
            <input id="manage-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="manage-duration">Duration (minutes)</label>
            <input id="manage-duration" className="input" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} />
          </div>
          <div>
            <label className="label" htmlFor="manage-status">Status</label>
            <select id="manage-status" className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={onSave}>Save Changes</button>
            <button className="btn btn-outline" type="button" onClick={() => globalThis.location.href = `/admin/tests/${id}/results`}>
              View Results
            </button>
            <button className="btn btn-danger-outline" onClick={onDelete}>Delete Test</button>
          </div>
        </div>

        <div className="card section-card">
          <h3>Question Bank Generation</h3>
          <p className="muted">Pull questions from your bank by difficulty.</p>
          <div className="grid grid-3">
            <div>
              <label className="label" htmlFor="bank-subject">Subject</label>
              <input id="bank-subject" className="input" value={bankGenerate.subject} onChange={(e) => setBankGenerate({ ...bankGenerate, subject: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="bank-difficulty">Difficulty</label>
              <select id="bank-difficulty" className="input" value={bankGenerate.difficulty} onChange={(e) => setBankGenerate({ ...bankGenerate, difficulty: e.target.value })}>
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="bank-count">Count</label>
              <input id="bank-count" className="input" type="number" value={bankGenerate.count} onChange={(e) => setBankGenerate({ ...bankGenerate, count: Number(e.target.value) })} />
            </div>
          </div>
          <button className="btn btn-outline" onClick={onGenerateFromBank}>Generate</button>
        </div>

        <div className="card section-card">
          <div className="inline" style={{ justifyContent: "space-between" }}>
            <h3>Pending AI Questions</h3>
            <button className="btn btn-outline" onClick={onApprovePending} disabled={!pendingQuestions.length}>
              Approve All
            </button>
          </div>
          {pendingQuestions.length === 0 && <p className="muted">No pending questions.</p>}
          {pendingQuestions.map((q) => (
            <div key={q._id} className="question-card stack">
              {editingQuestionId === q._id ? (
                <div className="stack">
                  <div>
                    <label className="label" htmlFor={`edit-pending-text-${q._id}`}>Question</label>
                    <input
                      id={`edit-pending-text-${q._id}`}
                      className="input"
                      value={editQuestion.text}
                      onChange={(e) => setEditQuestion({ ...editQuestion, text: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-2">
                    {editQuestion.options.map((opt, i) => (
                      <input
                        key={`edit-pending-opt-${q._id}-${i}`}
                        className="input"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const next = [...editQuestion.options];
                          next[i] = e.target.value;
                          setEditQuestion({ ...editQuestion, options: next });
                        }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-2">
                    <div>
                      <label className="label" htmlFor={`edit-pending-difficulty-${q._id}`}>Difficulty</label>
                      <select
                        id={`edit-pending-difficulty-${q._id}`}
                        className="input"
                        value={editQuestion.difficulty}
                        onChange={(e) => setEditQuestion({ ...editQuestion, difficulty: e.target.value as any })}
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                    <div>
                      <label className="label" htmlFor={`edit-pending-correct-${q._id}`}>Correct Index</label>
                      <select
                        id={`edit-pending-correct-${q._id}`}
                        className="input"
                        value={editQuestion.correctIndex}
                        onChange={(e) => setEditQuestion({ ...editQuestion, correctIndex: Number(e.target.value) })}
                      >
                        <option value={0}>Option 1</option>
                        <option value={1}>Option 2</option>
                        <option value={2}>Option 3</option>
                        <option value={3}>Option 4</option>
                      </select>
                    </div>
                  </div>
                  <div className="actions">
                    <button className="btn btn-primary" onClick={onSaveEditQuestion}>Save</button>
                    <button className="btn btn-outline" type="button" onClick={onCancelEditQuestion}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="inline" style={{ justifyContent: "space-between" }}>
                    <strong>{q.text}</strong>
                    <span className="badge">{q.difficulty}</span>
                  </div>
                  <div className="grid grid-2">
                    {q.options?.map((opt: string, i: number) => (
                      <div key={`${q._id}-pending-${i}`} className={i === q.correctIndex ? "" : "muted"}>
                        {i + 1}. {opt} {i === q.correctIndex ? "(Correct)" : ""}
                      </div>
                    ))}
                  </div>
                  <div className="muted">Correct Answer: {q.options?.[q.correctIndex] || "N/A"}</div>
                  <div className="actions">
                    <button className="btn btn-outline" type="button" onClick={() => onStartEditQuestion(q)}>Edit</button>
                    <button className="btn btn-primary" type="button" onClick={() => onApproveQuestion(q._id)}>
                      Approve
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="card section-card">
          <h3>Add Question</h3>
          <div>
            <label className="label" htmlFor="new-question-text">Question</label>
            <input id="new-question-text" className="input" value={newQuestion.text} onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })} />
          </div>
          <div className="grid grid-2">
            {newQuestion.options.map((opt, i) => (
              <input
                key={`new-opt-${opt}-${i}`}
                className="input"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const next = [...newQuestion.options];
                  next[i] = e.target.value;
                  setNewQuestion({ ...newQuestion, options: next });
                }}
              />
            ))}
          </div>
          <div className="grid grid-2">
            <div>
              <label className="label" htmlFor="new-difficulty">Difficulty</label>
              <select id="new-difficulty" className="input" value={newQuestion.difficulty} onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}>
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="new-correct">Correct Index</label>
              <select id="new-correct" className="input" value={newQuestion.correctIndex} onChange={(e) => setNewQuestion({ ...newQuestion, correctIndex: Number(e.target.value) })}>
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
                <option value={2}>Option 3</option>
                <option value={3}>Option 4</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={onAddQuestion}>Add Question</button>
        </div>

        <div className="card section-card">
          <h3>Test Questions</h3>
          {questions.length === 0 && <p className="muted">No questions added yet.</p>}
          {questions.map((q) => (
            <div key={q._id} className="question-card stack">
              {editingQuestionId === q._id ? (
                <div className="stack">
                  <div>
                    <label className="label" htmlFor={`edit-question-text-${q._id}`}>Question</label>
                    <input
                      id={`edit-question-text-${q._id}`}
                      className="input"
                      value={editQuestion.text}
                      onChange={(e) => setEditQuestion({ ...editQuestion, text: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-2">
                    {editQuestion.options.map((opt, i) => (
                      <input
                        key={`edit-opt-${q._id}-${i}`}
                        className="input"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const next = [...editQuestion.options];
                          next[i] = e.target.value;
                          setEditQuestion({ ...editQuestion, options: next });
                        }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-2">
                    <div>
                      <label className="label" htmlFor={`edit-difficulty-${q._id}`}>Difficulty</label>
                      <select
                        id={`edit-difficulty-${q._id}`}
                        className="input"
                        value={editQuestion.difficulty}
                        onChange={(e) => setEditQuestion({ ...editQuestion, difficulty: e.target.value as any })}
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                    <div>
                      <label className="label" htmlFor={`edit-correct-${q._id}`}>Correct Index</label>
                      <select
                        id={`edit-correct-${q._id}`}
                        className="input"
                        value={editQuestion.correctIndex}
                        onChange={(e) => setEditQuestion({ ...editQuestion, correctIndex: Number(e.target.value) })}
                      >
                        <option value={0}>Option 1</option>
                        <option value={1}>Option 2</option>
                        <option value={2}>Option 3</option>
                        <option value={3}>Option 4</option>
                      </select>
                    </div>
                  </div>
                  <div className="actions">
                    <button className="btn btn-primary" onClick={onSaveEditQuestion}>Save</button>
                    <button className="btn btn-outline" type="button" onClick={onCancelEditQuestion}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="inline" style={{ justifyContent: "space-between" }}>
                    <strong>{q.text}</strong>
                    <span className="badge">{q.difficulty}</span>
                  </div>
                  <div className="grid grid-2">
                    {q.options?.map((opt: string, i: number) => (
                      <div key={`${q._id}-${i}`} className={i === q.correctIndex ? "" : "muted"}>
                        {i + 1}. {opt} {i === q.correctIndex ? "(Correct)" : ""}
                      </div>
                    ))}
                  </div>
                  <div className="muted">Correct Answer: {q.options?.[q.correctIndex] || "N/A"}</div>
                  <div className="actions">
                    <button className="btn btn-outline" type="button" onClick={() => onStartEditQuestion(q)}>Edit</button>
                    <button className="btn btn-outline" onClick={() => onDeleteQuestion(q._id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
    </RequireRole>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import { NavBar } from "../../../components/NavBar";

export default function TakeTestPage() {
  const params = useParams();
  const id = params?.id as string;
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [attemptId, setAttemptId] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    setError("");
    apiFetch<{ role: string }>("/users/me")
      .then((res) => setRole(res.data?.role || ""))
      .catch(() => setRole(""));
    apiFetch<any>(`/tests/${id}`)
      .then((res) => {
        setTest(res.data);
        setSecondsLeft((res.data?.durationMinutes || 0) * 60);
      })
      .catch((e: any) => setError(e.message || "Failed to load test"));

    apiFetch<any>(`/questions?testId=${id}&approvalStatus=APPROVED`)
      .then((res) => setQuestions(res.data || []))
      .catch(() => setQuestions([]));

    apiFetch<{ role: string }>("/users/me")
      .then((res) => {
        const userRole = res.data?.role || "";
        if (userRole !== "USER") {
          setError("Preview only. Activate the test to allow student attempts.");
          return;
        }
        return apiFetch<any>("/attempts", {
          method: "POST",
          body: JSON.stringify({ testId: id })
        }).then((res2) => setAttemptId(res2.data?._id || ""));
      })
      .catch((e: any) => setError(e.message || "Unable to start attempt"));
  }, [id]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (!questions.length) return;
    const q = questions[currentIndex];
    if (!q?._id) return;
    setVisited((prev) => ({ ...prev, [q._id]: true }));
  }, [currentIndex, questions]);

  const formatted = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const secs = (secondsLeft % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }, [secondsLeft]);

  const submit = async (status: "SUBMITTED" | "TIMED_OUT") => {
    if (role && role !== "USER") {
      setError("Only students can submit attempts.");
      return;
    }
    if (submittedRef.current) return;
    if (!attemptId) {
      setError("Attempt not initialized yet. Please wait a moment.");
      return;
    }
    submittedRef.current = true;
    const payload = {
      status,
      answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex
      }))
    };
    try {
      const res = await apiFetch<any>(`/attempts/${attemptId}/submit`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      globalThis.localStorage.setItem("lastAttemptResult", JSON.stringify(res.data));
      globalThis.location.href = `/results/${attemptId}`;
    } catch (e: any) {
      submittedRef.current = false;
      setError(e.message || "Failed to submit attempt");
    }
  };

  const leaveTest = () => {
    const target = role === "ADMIN" || role === "TEACHER" ? "/admin/dashboard" : "/student/dashboard";
    globalThis.location.href = target;
  };

  useEffect(() => {
    if (secondsLeft === 0 && attemptId) {
      submit("TIMED_OUT");
    }
  }, [secondsLeft, attemptId]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        submit("SUBMITTED");
      }
    };

    const onBlur = () => {
      submit("SUBMITTED");
    };

    const onCopy = (event: ClipboardEvent) => {
      event.preventDefault();
    };

    const onCut = (event: ClipboardEvent) => {
      event.preventDefault();
    };

    const onPaste = (event: ClipboardEvent) => {
      event.preventDefault();
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, [attemptId, role, answers]);

  const currentQuestion = questions[currentIndex];

  const onSubmitClick = () => {
    if (!attemptId) {
      setError("Attempt not initialized yet. Please wait a moment.");
      return;
    }
    if (globalThis.confirm("Submit your exam now? You will not be able to change answers.")) {
      submit("SUBMITTED");
    }
  };

  const getQuestionState = (id: string) => {
    if (marked[id]) return "marked";
    if (typeof answers[id] === "number") return "answered";
    if (visited[id]) return "unanswered";
    return "not-visited";
  };

  return (
    <div className="page exam-page test-secure">
      <NavBar />
      <div className="exam-shell">
        <header className="exam-header">
          <div>
            <h1>{test?.title || "Exam"}</h1>
            <p className="muted">Auto‑save on • Secure mode enabled</p>
          </div>
          <div className="exam-status">
            <span className="pill">Exam in Progress</span>
            <div className="timer">{formatted}</div>
          </div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="exam-body">
          <aside className="exam-sidebar">
            <div className="sidebar-title">
              <strong>Questions</strong>
              <span className="muted">{currentIndex + 1} / {questions.length}</span>
            </div>
            <div className="question-grid">
              {questions.map((q, index) => {
                const state = getQuestionState(q._id);
                return (
                  <button
                    key={q._id}
                    type="button"
                    className={`question-chip ${state} ${index === currentIndex ? "active" : ""}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Question ${index + 1} ${state.replace("-", " ")}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="legend">
              <span><i className="dot not-visited" />Not visited</span>
              <span><i className="dot answered" />Answered</span>
              <span><i className="dot marked" />Marked</span>
              <span><i className="dot unanswered" />Unanswered</span>
            </div>
          </aside>

          <section className="exam-content">
            <div className="question-card">
              <div className="question-header">
                <span className="pill">Question {currentIndex + 1}</span>
                <span className="progress">{Math.min(currentIndex + 1, questions.length)} of {questions.length}</span>
              </div>
              {currentQuestion ? (
                <>
                  <h2>{currentQuestion.text}</h2>
                  <div className="options">
                    {currentQuestion.options.map((opt: string, i: number) => (
                      <button
                        key={`${currentQuestion._id}-${opt}`}
                        type="button"
                        className={`option ${answers[currentQuestion._id] === i ? "selected" : ""}`}
                        onClick={() => setAnswers({ ...answers, [currentQuestion._id]: i })}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="muted">No questions available.</p>
              )}
            </div>
          </section>
        </div>

        <div className="exam-footer">
          <button
            className="btn btn-ghost"
            onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            disabled={currentIndex === 0}
          >
            Previous
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))}
            disabled={currentIndex >= questions.length - 1}
          >
            Next
          </button>
          <button
            className={`btn btn-outline ${currentQuestion?._id && marked[currentQuestion._id] ? "active" : ""}`}
            type="button"
            onClick={() => {
              if (!currentQuestion?._id) return;
              setMarked((prev) => ({ ...prev, [currentQuestion._id]: !prev[currentQuestion._id] }));
            }}
          >
            Mark for Review
          </button>
          <div className="exam-footer-spacer" />
          <button className="btn btn-outline" type="button" onClick={leaveTest}>
            Leave Exam
          </button>
          <button className="btn btn-primary" onClick={onSubmitClick} disabled={!attemptId}>
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <div className="container test-secure">
      <NavBar />
      <div className="inline" style={{ justifyContent: "space-between" }}>
        <h2>{test?.title || "Test"}</h2>
        <div className="inline">
          <span className="progress">Question {Math.min(currentIndex + 1, questions.length)} of {questions.length}</span>
          <span className="timer">{formatted}</span>
        </div>
      </div>
      <div className="stack" style={{ marginTop: 16 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {currentQuestion ? (
          <div className="card stack">
            <strong>{currentIndex + 1}. {currentQuestion.text}</strong>
            <div className="stack">
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
          </div>
        ) : (
          <div className="card">No questions available.</div>
        )}
      </div>
      <div className="actions" style={{ marginTop: 16 }}>
        <button
          className="btn btn-outline"
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1))}
          disabled={currentIndex >= questions.length - 1}
        >
          Next
        </button>
        <button className="btn btn-primary" onClick={() => submit("SUBMITTED")} disabled={!attemptId}>
          Submit Test
        </button>
        <button className="btn btn-outline" type="button" onClick={leaveTest}>
          Leave Test
        </button>
      </div>
    </div>
  );
}

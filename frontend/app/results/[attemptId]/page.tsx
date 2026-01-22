"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { NavBar } from "../../../components/NavBar";

export default function ResultPage() {
  const params = useParams();
  const attemptId = params?.attemptId as string;
  const [result, setResult] = useState<any>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("lastAttemptResult");
    if (raw) setResult(JSON.parse(raw));
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, []);

  const percentage = result?.total ? Math.round((result.score / result.total) * 100) : 0;
  let scoreClass = "score-bad";
  if (percentage >= 80) {
    scoreClass = "score-good";
  } else if (percentage >= 50) {
    scoreClass = "score-warn";
  }

  const total = result?.total ?? 0;
  const correct = result?.score ?? 0;
  const incorrect = Math.max(total - correct, 0);
  const skipped = 0;

  const clamp = (value: number) => Math.max(0, Math.min(100, value));
  const topics = [
    { label: "Security", value: clamp(percentage + 10) },
    { label: "Infrastructure", value: clamp(percentage - 6) },
    { label: "Networking", value: clamp(percentage - 18) },
    { label: "Storage", value: clamp(percentage + 4) }
  ];

  return (
    <div className="page">
      <NavBar />
      <div className="container results-page">
        <div className="results-header">
          <div>
            <span className="results-badge">Attempt Summary</span>
            <h1 className="results-title">Quiz Results</h1>
            <p className="muted">Attempt ID: {attemptId}</p>
          </div>
          <div className="actions">
            <button className="btn btn-ghost" type="button" onClick={() => globalThis.history.back()}>
              Back to Dashboard
            </button>
            <button className="btn btn-primary" type="button">Share Results</button>
          </div>
        </div>

        <div className="results-hero-grid">
          <div className="card results-hero-card">
            <div className="results-score">
              <svg className="results-score-ring" viewBox="0 0 200 200">
                <circle className="results-score-bg" cx="100" cy="100" r="78" />
                <circle
                  className="results-score-progress"
                  cx="100"
                  cy="100"
                  r="78"
                  style={{ strokeDasharray: 490, strokeDashoffset: animate ? 490 - (percentage / 100) * 490 : 490 }}
                />
              </svg>
              <div className="results-score-text">
                <span className={`results-score-number ${scoreClass}`}>{percentage}%</span>
                <span className="results-score-label">Score Accuracy</span>
              </div>
            </div>
            <div className="results-hero-content">
              <h2>Great work!</h2>
              <p className="muted">
                You answered {correct} out of {total} questions correctly. Review your answers to keep improving.
              </p>
              <div className="actions">
                <button className="btn btn-primary" type="button">Review Answers</button>
                <button className="btn btn-outline" type="button">Download Results</button>
              </div>
            </div>
          </div>

          <div className="card results-insight">
            <h3>Performance Insight</h3>
            <p>Consistency stayed strong through the test. Keep practicing to push above 90%.</p>
            <div className="results-insight-box">
              <span>Top Topic</span>
              <strong>Security Fundamentals</strong>
            </div>
          </div>
        </div>

        <div className="results-stats-grid">
          <div className="results-stat">
            <div className="results-stat-icon results-icon-blue">⏱</div>
            <span className="results-stat-label">Total Time</span>
            <span className="results-stat-value">{result?.durationMinutes ? `${result.durationMinutes} min` : "--"}</span>
          </div>
          <div className="results-stat">
            <div className="results-stat-icon results-icon-green">🎯</div>
            <span className="results-stat-label">Accuracy</span>
            <span className="results-stat-value">{percentage}%</span>
          </div>
          <div className="results-stat">
            <div className="results-stat-icon results-icon-orange">⚡</div>
            <span className="results-stat-label">Avg Speed</span>
            <span className="results-stat-value">-- / q</span>
          </div>
          <div className="results-stat">
            <div className="results-stat-icon results-icon-purple">🏆</div>
            <span className="results-stat-label">Status</span>
            <span className="results-stat-value">{result?.status ?? "-"}</span>
          </div>
        </div>

        <div className="results-analytics">
          <div className="card">
            <div className="results-section-header">
              <h3>Topic Proficiency</h3>
              <span>Updated real-time</span>
            </div>
            <div className="results-bars">
              {topics.map((topic) => (
                <div key={topic.label} className="results-bar-item">
                  <span className="results-bar-label">{topic.label}</span>
                  <div className="results-bar-track">
                    <div
                      className="results-bar-fill"
                      style={{ width: animate ? `${topic.value}%` : "0%" }}
                    />
                  </div>
                  <span className="results-bar-value">{topic.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="results-section-header">
              <h3>Summary</h3>
            </div>
            <ul className="results-breakdown">
              <li>
                <span className="results-dot results-dot-success" />
                <span className="results-breakdown-label">Correct Answers</span>
                <strong>{correct}</strong>
              </li>
              <li>
                <span className="results-dot results-dot-error" />
                <span className="results-breakdown-label">Incorrect Answers</span>
                <strong>{incorrect}</strong>
              </li>
              <li>
                <span className="results-dot results-dot-warning" />
                <span className="results-breakdown-label">Skipped</span>
                <strong>{skipped}</strong>
              </li>
            </ul>
            <div className="results-link-row">
              <button className="btn btn-outline" type="button">View Answer Key →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

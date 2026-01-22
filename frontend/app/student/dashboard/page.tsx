"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";
import { NavBar } from "../../../components/NavBar";
import { RequireRole } from "../../../components/RequireRole";

export default function StudentDashboard() {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>("/tests?page=1&limit=20")
      .then((res) => setTests(res.data || []))
      .catch(() => setTests([]));
  }, []);

  return (
    <RequireRole roles={["USER"]}>
      <div className="page">
        <NavBar />
        <div className="container dashboard">
          <header className="page-header">
            <div>
              <h1>Student Dashboard</h1>
              <p className="muted">Your upcoming exams, results, and progress at a glance.</p>
            </div>
          </header>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="muted">Upcoming Exams</span>
              <strong>{tests.filter((t) => t.status === "ACTIVE").length}</strong>
            </div>
            <div className="stat-card">
              <span className="muted">Completed</span>
              <strong>{tests.filter((t) => t.status === "ARCHIVED").length}</strong>
            </div>
            <div className="stat-card">
              <span className="muted">Average Score</span>
              <strong>—</strong>
            </div>
            <div className="stat-card">
              <span className="muted">Certificates</span>
              <strong>—</strong>
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="card section-card">
              <div className="section-header-row">
                <div>
                  <h2>Upcoming Exams</h2>
                  <p className="muted">Start an exam when you are ready.</p>
                </div>
              </div>
              <div className="list">
                {tests.map((t) => (
                  <div key={t._id} className="list-row">
                    <div>
                      <h3>{t.title}</h3>
                      <p className="muted">{t.subject} • {t.durationMinutes} mins</p>
                    </div>
                    <div className="list-actions">
                      <span className="pill">{t.status}</span>
                      <Link className="btn btn-primary" href={`/tests/${t._id}`}>Start</Link>
                      <Link className="btn btn-ghost" href={`/tests/${t._id}`}>Details</Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="stack">
              <div className="card section-card">
                <h2>Performance Analytics</h2>
                <p className="muted">Your score trends will appear after your first attempt.</p>
                <div className="placeholder-chart">
                  <div />
                </div>
              </div>
              <div className="card section-card">
                <h2>Notifications</h2>
                <ul className="notification-list">
                  <li>Results will appear here after submission.</li>
                  <li>New exams will show up instantly.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}

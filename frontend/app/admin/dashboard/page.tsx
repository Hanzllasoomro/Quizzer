"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";
import { NavBar } from "../../../components/NavBar";
import { RequireRole } from "../../../components/RequireRole";
import { useToast } from "../../../components/ToastProvider";

export default function AdminDashboard() {
  const [tests, setTests] = useState<any[]>([]);
  const { show } = useToast();

  useEffect(() => {
    apiFetch<any[]>("/tests?page=1&limit=20")
      .then((res) => setTests(res.data || []))
      .catch(() => setTests([]));
  }, []);

  const deleteTest = async (testId: string) => {
    if (!globalThis.confirm("Delete this test?")) return;
    try {
      await apiFetch(`/tests/${testId}`, { method: "DELETE" });
      setTests((prev) => prev.filter((t) => t._id !== testId));
      show("Test deleted successfully", "success");
    } catch {
      show("Failed to delete test", "error");
    }
  };

  return (
    <RequireRole roles={["ADMIN", "TEACHER"]}>
      <div className="page">
        <NavBar />
        <div className="container dashboard">
          <header className="page-header">
            <div>
              <h1>Admin Dashboard</h1>
              <p className="muted">Manage tests, questions, and results with clarity.</p>
            </div>
            <Link className="btn btn-primary" href="/admin/tests/create">Create Test</Link>
          </header>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="muted">Total Tests</span>
              <strong>{tests.length}</strong>
            </div>
            <div className="stat-card">
              <span className="muted">Active Tests</span>
              <strong>{tests.filter((t) => t.status === "ACTIVE").length}</strong>
            </div>
            <div className="stat-card">
              <span className="muted">Drafts</span>
              <strong>{tests.filter((t) => t.status === "DRAFT").length}</strong>
            </div>
            <div className="stat-card">
              <span className="muted">Results Published</span>
              <strong>—</strong>
            </div>
          </div>

          <div className="dashboard-grid admin-grid">
            <aside className="card section-card">
              <h2>Quick Actions</h2>
              <div className="stack">
                <Link className="btn btn-outline" href="/admin/tests/create">Create Test</Link>
                <Link className="btn btn-outline" href="/admin/dashboard#tests">Manage Tests</Link>
                <Link className="btn btn-outline" href="/admin/dashboard#tests">Review Results</Link>
              </div>
            </aside>

            <section id="tests" className="card section-card">
              <div className="section-header-row">
                <div>
                  <h2>All Tests</h2>
                  <p className="muted">Review, edit, and monitor test status.</p>
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
                      <Link className="btn btn-ghost" href={`/tests/${t._id}`}>Preview</Link>
                      <Link className="btn btn-outline" href={`/admin/tests/${t._id}`}>Manage</Link>
                      <Link className="btn btn-ghost" href={`/admin/tests/${t._id}/results`}>Results</Link>
                      <button className="btn btn-danger-outline" onClick={() => deleteTest(t._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}

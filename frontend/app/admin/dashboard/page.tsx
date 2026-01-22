"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";
import { NavBar } from "../../../components/NavBar";
import { RequireRole } from "../../../components/RequireRole";

export default function AdminDashboard() {
  const [tests, setTests] = useState<any[]>([]);

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
    } catch {
      // ignore
    }
  };

  return (
    <RequireRole roles={["ADMIN", "TEACHER"]}>
      <div className="container">
        <NavBar />
      <div className="inline" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div className="page-title">Admin Dashboard</div>
          <p className="muted">Manage tests, questions, and results</p>
        </div>
        <Link className="btn btn-primary" href="/admin/tests/create">Create Test</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
        <div className="sidebar stack">
          <strong>Quick Actions</strong>
          <Link className="btn btn-outline" href="/admin/tests/create">Create Test</Link>
          <Link className="btn btn-outline" href="/admin/dashboard#tests">Manage Tests</Link>
          <Link className="btn btn-outline" href="/admin/dashboard#tests">Review Results</Link>
        </div>

        <div className="stack">
          <div className="grid grid-3">
            <div className="card stack">
              <span className="muted">Total Tests</span>
              <div className="stat-number">{tests.length}</div>
            </div>
            <div className="card stack">
              <span className="muted">Active Tests</span>
              <div className="stat-number">
                {tests.filter((t) => t.status === "ACTIVE").length}
              </div>
            </div>
            <div className="card stack">
              <span className="muted">Drafts</span>
              <div className="stat-number">
                {tests.filter((t) => t.status === "DRAFT").length}
              </div>
            </div>
          </div>

          <div id="tests" className="grid" style={{ marginTop: 12 }}>
            {tests.map((t) => (
              <div key={t._id} className="card stack">
                <div className="inline" style={{ justifyContent: "space-between" }}>
                  <h3>{t.title}</h3>
                  <span className="badge">{t.status}</span>
                </div>
                <p className="muted">{t.subject} • {t.durationMinutes} mins</p>
                <div className="actions">
                  <Link className="btn btn-outline" href={`/tests/${t._id}`}>View / Take</Link>
                  <Link className="btn btn-outline" href={`/admin/tests/${t._id}`}>Manage</Link>
                  <Link className="btn btn-outline" href={`/admin/tests/${t._id}/results`}>View Results</Link>
                  <button className="btn btn-danger-outline" onClick={() => deleteTest(t._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </RequireRole>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../../../lib/api";
import { NavBar } from "../../../../../components/NavBar";
import { RequireRole } from "../../../../../components/RequireRole";
import { useToast } from "../../../../../components/ToastProvider";

export default function AdminTestResultsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [results, setResults] = useState<any[]>([]);
  const { show } = useToast();

  useEffect(() => {
    if (!id) return;
    apiFetch<any[]>(`/analytics/tests/${id}/results`)
      .then((res) => setResults(res.data || []))
      .catch((e: any) => show(e.message || "Failed to load results", "error"));
  }, [id, show]);

  return (
    <RequireRole roles={["ADMIN", "TEACHER"]}>
      <div className="page">
        <NavBar />
        <div className="container dashboard">
          <header className="page-header">
            <div>
              <h1>Test Results</h1>
              <p className="muted">All attempts for this test</p>
            </div>
            <button className="btn btn-ghost" type="button" onClick={() => globalThis.history.back()}>
              Back
            </button>
          </header>

          <div className="card section-card">
            {results.length === 0 && <p className="muted">No results yet.</p>}
            <div className="list">
              {results.map((r) => (
                <div key={r._id} className="list-row">
                  <div>
                    <h3>{r.userId?.name || "Unknown"}</h3>
                    <p className="muted">Email: {r.userId?.email || "-"}</p>
                    <p className="muted">Submitted: {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "-"}</p>
                  </div>
                  <div className="list-actions">
                    <span className="pill">{r.status}</span>
                    <strong>Score: {r.score}/{r.total}</strong>
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

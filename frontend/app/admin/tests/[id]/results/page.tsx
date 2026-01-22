"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../../../lib/api";
import { NavBar } from "../../../../../components/NavBar";
import { RequireRole } from "../../../../../components/RequireRole";

export default function AdminTestResultsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setError("");
    apiFetch<any[]>(`/analytics/tests/${id}/results`)
      .then((res) => setResults(res.data || []))
      .catch((e: any) => setError(e.message || "Failed to load results"));
  }, [id]);

  return (
    <RequireRole roles={["ADMIN", "TEACHER"]}>
      <div className="container">
        <NavBar />
        <div className="inline" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div className="page-title">Test Results</div>
            <p className="muted">All attempts for this test</p>
          </div>
          <button className="btn btn-outline" type="button" onClick={() => globalThis.history.back()}>
            Back
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card stack">
          {results.length === 0 && <p className="muted">No results yet.</p>}
          {results.map((r) => (
            <div key={r._id} className="question-card stack">
              <div className="inline" style={{ justifyContent: "space-between" }}>
                <strong>
                  Student: {r.userId?.name || "Unknown"}
                </strong>
                <span className="badge">{r.status}</span>
              </div>
              <div className="muted">Email: {r.userId?.email || "-"}</div>
              <div className="inline" style={{ gap: 16 }}>
                <span>Score: {r.score}/{r.total}</span>
                <span className="muted">Submitted: {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "-"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RequireRole>
  );
}

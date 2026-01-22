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
      <div className="container">
        <NavBar />
      <div className="inline" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div className="page-title">Student Dashboard</div>
          <p className="muted">Choose a test and start when ready</p>
        </div>
      </div>

      <div className="grid grid-3">
        {tests.map((t) => (
          <div key={t._id} className="card stack">
            <div className="inline" style={{ justifyContent: "space-between" }}>
              <h3>{t.title}</h3>
              <span className="badge">{t.status}</span>
            </div>
            <p className="muted">{t.subject} • {t.durationMinutes} mins</p>
            <div className="actions">
              <Link className="btn btn-primary" href={`/tests/${t._id}`}>Start Test</Link>
              <Link className="btn btn-outline" href={`/tests/${t._id}`}>View Details</Link>
            </div>
          </div>
        ))}
      </div>
      </div>
    </RequireRole>
  );
}

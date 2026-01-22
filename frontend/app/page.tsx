import Link from "next/link";
import { NavBar } from "../components/NavBar";

export default function Home() {
  return (
    <div className="container">
      <NavBar />

      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <div className="stack" style={{ gap: 8 }}>
          <div className="badge" style={{ width: "fit-content" }}>Online Examination Portal</div>
          <h1 style={{ fontSize: 36, fontWeight: 700 }}>Quiz App</h1>
          <p className="muted" style={{ fontSize: 16 }}>
            A secure, scalable assessment platform for teachers and students. Create tests, generate questions, and get instant results.
          </p>
          <div className="actions" style={{ marginTop: 8 }}>
            <Link className="btn btn-primary" href="/auth/login">Get Started</Link>
            <Link className="btn btn-outline" href="/auth/signup">Create Account</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card stack">
          <h3>Admin Control</h3>
          <p className="muted">Create tests, manage questions, approve AI items, and analyze results.</p>
        </div>
        <div className="card stack">
          <h3>Student Experience</h3>
          <p className="muted">Timed tests with instant scores and easy result tracking.</p>
        </div>
        <div className="card stack">
          <h3>Secure & Reliable</h3>
          <p className="muted">JWT auth, role-based access, and automatic submission on timeout.</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, padding: 24 }}>
        <div className="grid grid-2">
          <div className="stack">
            <h3>For Teachers</h3>
            <p className="muted">Create exams, generate questions by difficulty, and review performance.</p>
            <Link className="btn btn-outline" href="/admin/dashboard">Go to Admin Dashboard</Link>
          </div>
          <div className="stack">
            <h3>For Students</h3>
            <p className="muted">Pick a test, answer questions, and get instant results.</p>
            <Link className="btn btn-outline" href="/student/dashboard">Go to Student Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

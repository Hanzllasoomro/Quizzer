import Link from "next/link";
import { NavBar } from "../components/NavBar";

export default function Home() {
  return (
    <div className="page">
      <NavBar />

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Online Examination Website</span>
              <h1>Secure. Fair. Smart online examinations.</h1>
              <p className="lead">
                A professional assessment platform with AI‑powered proctoring, real‑time analytics, and a
                distraction‑free exam experience.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/auth/signup">Get Started</Link>
                <Link className="btn btn-ghost" href="/auth/login">Login</Link>
              </div>
              <div className="trust-row">
                <span>WCAG 2.1 AA</span>
                <span>Auto‑Save</span>
                <span>Secure Proctoring</span>
              </div>
            </div>

            <div className="hero-card">
              <div className="hero-card-header">
                <span className="badge">Live Exam</span>
                <span className="muted">Exam in Progress</span>
              </div>
              <div className="hero-card-body">
                <div className="hero-stat">
                  <span>Time Remaining</span>
                  <strong>01:24:09</strong>
                </div>
                <div className="hero-stat">
                  <span>Questions Answered</span>
                  <strong>24 / 40</strong>
                </div>
                <div className="hero-progress">
                  <div className="hero-progress-fill" style={{ width: "60%" }} />
                </div>
                <div className="hero-actions">
                  <button className="btn btn-outline" type="button">Resume Exam</button>
                  <button className="btn btn-ghost" type="button">Instructions</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>How it works</h2>
              <p className="muted">Three steps designed for clarity and confidence.</p>
            </div>
            <div className="feature-grid">
              <div className="feature-card">
                <span className="step">01</span>
                <h3>Register</h3>
                <p>Create your account in seconds and verify your identity.</p>
              </div>
              <div className="feature-card">
                <span className="step">02</span>
                <h3>Attempt Exam</h3>
                <p>Start the exam with a distraction‑free interface and live timer.</p>
              </div>
              <div className="feature-card">
                <span className="step">03</span>
                <h3>Get Results Instantly</h3>
                <p>See scores, analytics, and insights the moment you submit.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="container">
            <div className="section-header">
              <h2>Features built for trust</h2>
              <p className="muted">Everything you need to run reliable, secure exams.</p>
            </div>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Secure Exam Environment</h3>
                <p>Auto‑save, tab‑switch warnings, and integrity indicators.</p>
              </div>
              <div className="feature-card">
                <h3>Live Proctoring</h3>
                <p>AI‑assisted invigilation and verified identity checks.</p>
              </div>
              <div className="feature-card">
                <h3>Instant Results</h3>
                <p>Immediate grading and downloadable reports.</p>
              </div>
              <div className="feature-card">
                <h3>Performance Analytics</h3>
                <p>Subject‑wise insights and trend analysis.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Trusted by institutions</h2>
              <p className="muted">Built for universities, certifications, and enterprise training.</p>
            </div>
            <div className="trust-grid">
              <div className="trust-card">Northbridge University</div>
              <div className="trust-card">Global Skills Council</div>
              <div className="trust-card">Apex Certification</div>
              <div className="trust-card">Summit Learning</div>
            </div>
            <div className="testimonial-grid">
              <div className="testimonial">
                <p>“The interface removed anxiety for our students. Results are instant and reliable.”</p>
                <span>Director of Assessments</span>
              </div>
              <div className="testimonial">
                <p>“Proctoring is seamless. We launched nationwide exams without disruptions.”</p>
                <span>Certification Lead</span>
              </div>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container cta-inner">
            <div>
              <h2>Ready to test your skills?</h2>
              <p className="muted">Launch professional, secure exams in minutes.</p>
            </div>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/auth/signup">Create Account</Link>
              <Link className="btn btn-outline" href="/auth/login">Login</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>© Quiz App 2026</span>
          <div className="footer-links">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Accessibility</Link>
            <Link href="#">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

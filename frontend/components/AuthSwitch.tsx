"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faGoogle, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { apiFetch, setToken, API_BASE } from "../lib/api";

type Mode = "login" | "signup";

type Props = {
  initialMode?: Mode;
};

export function AuthSwitch({ initialMode = "login" }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupMessage, setSignupMessage] = useState("");

  const router = useRouter();

  const startOAuth = (provider: "google" | "facebook" | "linkedin") => {
    globalThis.location.href = `${API_BASE}/auth/${provider}`;
  };

  const onLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await apiFetch<{ user: { role: string }; accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      if (res.data?.accessToken) {
        setToken(res.data.accessToken);
        let role: string | undefined = res.data.user?.role;
        if (!role) {
          const me = await apiFetch<{ role: string }>("/users/me");
          role = me.data?.role;
        }
        if (role === "ADMIN" || role === "TEACHER") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/student/dashboard");
        }
      }
    } catch (e: any) {
      setLoginError(e.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const onSignup = async () => {
    setSignupError("");
    setSignupMessage("");
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword })
      });
      setSignupMessage("Account created. You can login now.");
      setMode("login");
    } catch (e: any) {
      setSignupError(e.message || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-brand">
          <span className="nav-mark">Q</span>
          <div>
            <h2>Quiz App</h2>
            <p className="muted">Secure, fair, smart online examinations.</p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
              role="tab"
              aria-selected={mode === "login"}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => setMode("signup")}
              role="tab"
              aria-selected={mode === "signup"}
            >
              Create Account
            </button>
          </div>

          <div className="auth-socials">
            <button type="button" className="social-btn" aria-label="Facebook" onClick={() => startOAuth("facebook")}>
              <FontAwesomeIcon icon={faFacebookF} />
            </button>
            <button type="button" className="social-btn" aria-label="Google" onClick={() => startOAuth("google")}>
              <FontAwesomeIcon icon={faGoogle} />
            </button>
            <button type="button" className="social-btn" aria-label="LinkedIn" onClick={() => startOAuth("linkedin")}>
              <FontAwesomeIcon icon={faLinkedinIn} />
            </button>
          </div>
          <p className="auth-divider">or continue with email</p>

          {mode === "login" ? (
            <div className="auth-form">
              <label className="label" htmlFor="login-email">Email</label>
              <input id="login-email" className="input" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <label className="label" htmlFor="login-password">Password</label>
              <input id="login-password" className="input" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              <Link className="auth-link" href="#">Forgot your password?</Link>
              {loginError && <div className="alert alert-error">{loginError}</div>}
              <button type="button" className="btn btn-primary" onClick={onLogin} disabled={loginLoading}>
                {loginLoading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          ) : (
            <div className="auth-form">
              <label className="label" htmlFor="signup-name">Full Name</label>
              <input id="signup-name" className="input" type="text" placeholder="Your name" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
              <label className="label" htmlFor="signup-email">Email</label>
              <input id="signup-email" className="input" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
              <label className="label" htmlFor="signup-password">Password</label>
              <input id="signup-password" className="input" type="password" placeholder="Create a strong password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
              {signupError && <div className="alert alert-error">{signupError}</div>}
              {signupMessage && <div className="alert alert-success">{signupMessage}</div>}
              <button type="button" className="btn btn-primary" onClick={onSignup}>Create Account</button>
            </div>
          )}

          <Link className="auth-link" href="/">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

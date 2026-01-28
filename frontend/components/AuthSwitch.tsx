"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faGoogle, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { apiFetch, setToken, API_BASE } from "../lib/api";
import { useToast } from "./ToastProvider";

type Mode = "login" | "signup";

type Props = {
  initialMode?: Mode;
};

export function AuthSwitch({ initialMode = "login" }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const router = useRouter();
  const { show } = useToast();

  useEffect(() => {
    const token = globalThis.localStorage?.getItem("accessToken");
    if (token) {
      router.replace("/");
    }
  }, [router]);

  const startOAuth = (provider: "google" | "facebook" | "linkedin") => {
    globalThis.location.href = `${API_BASE}/auth/${provider}`;
  };

  const onLogin = async () => {
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
        show("Signed in successfully.", "success", 2500);
        if (role === "ADMIN" || role === "TEACHER") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/student/dashboard");
        }
      }
    } catch (e: any) {
      show(e.message || "Login failed", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const onSignup = async () => {
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword })
      });
      show("Account created. You can login now.", "success");
      setMode("login");
    } catch (e: any) {
      show(e.message || "Signup failed", "error");
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
              <button type="button" className="btn btn-primary" onClick={onSignup}>Create Account</button>
            </div>
          )}

          <Link className="auth-link" href="/">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

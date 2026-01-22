"use client";

import { useMemo, useState } from "react";
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

  const containerClassName = useMemo(
    () => `auth-switch-container ${mode === "signup" ? "right-panel-active" : ""}`,
    [mode]
  );

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
    <div className="auth-switch-root">
      <div className={containerClassName} id="container">
        <div className="form-container sign-up-container">
          <div className="auth-switch-form">
            <h1>Create Account</h1>
            <div className="social-container">
              <button type="button" className="social" aria-label="Facebook" onClick={() => startOAuth("facebook")}>
                <FontAwesomeIcon icon={faFacebookF} />
              </button>
              <button type="button" className="social" aria-label="Google" onClick={() => startOAuth("google")}>
                <FontAwesomeIcon icon={faGoogle} />
              </button>
              <button type="button" className="social" aria-label="LinkedIn" onClick={() => startOAuth("linkedin")}>
                <FontAwesomeIcon icon={faLinkedinIn} />
              </button>
            </div>
            <span>or use your email for registration</span>
            <input type="text" placeholder="Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
            <input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
            {signupError && <div className="auth-switch-alert error">{signupError}</div>}
            {signupMessage && <div className="auth-switch-alert success">{signupMessage}</div>}
            <button type="button" onClick={onSignup}>Sign Up</button>
            <Link className="auth-switch-link" href="/">Back to Home</Link>
          </div>
        </div>

        <div className="form-container sign-in-container">
          <div className="auth-switch-form">
            <h1>Sign in</h1>
            <div className="social-container">
              <button type="button" className="social" aria-label="Facebook" onClick={() => startOAuth("facebook")}>
                <FontAwesomeIcon icon={faFacebookF} />
              </button>
              <button type="button" className="social" aria-label="Google" onClick={() => startOAuth("google")}>
                <FontAwesomeIcon icon={faGoogle} />
              </button>
              <button type="button" className="social" aria-label="LinkedIn" onClick={() => startOAuth("linkedin")}>
                <FontAwesomeIcon icon={faLinkedinIn} />
              </button>
            </div>
            <span>or use your account</span>
            <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            <Link className="auth-switch-link" href="#">Forgot your password?</Link>
            {loginError && <div className="auth-switch-alert error">{loginError}</div>}
            <button type="button" onClick={onLogin} disabled={loginLoading}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
            <Link className="auth-switch-link" href="/">Back to Home</Link>
          </div>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="auth-switch-primary ghost" type="button" onClick={() => setMode("login")}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="auth-switch-primary ghost" type="button" onClick={() => setMode("signup")}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

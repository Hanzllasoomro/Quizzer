"use client";

import Link from "next/link";
import { clearToken } from "../lib/api";
import { useEffect, useState } from "react";

export const NavBar = () => {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!globalThis.localStorage?.getItem("accessToken"));
  }, []);

  return (
    <div className="nav">
      <div className="nav-left">
        <Link href="/" className="nav-logo">
          <span className="nav-mark" aria-hidden>
            Q
          </span>
          <span className="nav-title">Quiz App</span>
        </Link>
      </div>

      <div className="nav-center">
        <div className="nav-status" aria-live="polite">
          <span className="status-dot" />
          Exam in Progress
          <span className="status-time">00:00:00</span>
        </div>
      </div>

      <div className="nav-right">
        {!hasToken && (
          <div className="nav-actions">
            <Link href="/auth/login" className="btn btn-ghost">
              Login
            </Link>
            <Link href="/auth/signup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        )}
        {hasToken && (
          <div className="nav-actions">
            <Link href="/student/dashboard" className="btn btn-ghost">
              Dashboard
            </Link>
            <span className="nav-avatar" aria-label="Profile">
              SA
            </span>
            <button
              className="btn btn-ghost"
              onClick={() => {
                clearToken();
                globalThis.location.href = "/auth/login";
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

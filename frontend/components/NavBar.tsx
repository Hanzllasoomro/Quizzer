"use client";

import Link from "next/link";
import { apiFetch, clearToken } from "../lib/api";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const NavBar = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(() => {
    if (globalThis.window === undefined) return false;
    return !!globalThis.localStorage.getItem("accessToken");
  });
  const [dashboardPath, setDashboardPath] = useState("/student/dashboard");

  useEffect(() => {
    setMounted(true);
    const readToken = () => setHasToken(!!globalThis.localStorage?.getItem("accessToken"));
    readToken();
    const onStorage = (event: StorageEvent) => {
      if (event.key === "accessToken") readToken();
    };
    globalThis.addEventListener("storage", onStorage);
    return () => globalThis.removeEventListener("storage", onStorage);
  }, [pathname]);

  useEffect(() => {
    if (!hasToken) return;
    apiFetch<{ role: string }>("/users/me")
      .then((res) => {
        const role = res.data?.role || "USER";
        if (role === "ADMIN" || role === "TEACHER") {
          setDashboardPath("/admin/dashboard");
        } else {
          setDashboardPath("/student/dashboard");
        }
      })
      .catch(() => setDashboardPath("/student/dashboard"));
  }, [hasToken]);

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
        {mounted && !hasToken && (
          <div className="nav-actions">
            <Link href="/auth/login" className="btn btn-ghost">
              Login
            </Link>
            <Link href="/auth/signup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        )}
        {mounted && hasToken && (
          <div className="nav-actions">
            <Link href={dashboardPath} className="btn btn-ghost">
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

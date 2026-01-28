"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, setToken } from "../../../../lib/api";
import { useToast } from "../../../../components/ToastProvider";

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { show } = useToast();

  const accessToken = useMemo(() => searchParams.get("accessToken") || "", [searchParams]);
  const roleFromQuery = useMemo(() => searchParams.get("role") || "", [searchParams]);

  useEffect(() => {
    if (!accessToken) {
      show("Missing access token", "error");
      return;
    }
    setToken(accessToken);

    const go = async () => {
      let role = roleFromQuery;
      if (!role) {
        const me = await apiFetch<{ role: string }>("/users/me");
        role = me.data?.role || "USER";
      }
      if (role === "ADMIN" || role === "TEACHER") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    };

    go().catch((e: any) => {
      show(e.message || "OAuth login failed", "error");
    });
  }, [accessToken, roleFromQuery, router, show]);

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <strong>Signing you in…</strong>
          <p className="muted">Please wait while we complete your login.</p>
        </div>
      </div>
    </div>
  );
}

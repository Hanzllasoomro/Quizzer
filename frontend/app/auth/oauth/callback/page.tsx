"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, setToken } from "../../../../lib/api";

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  const accessToken = useMemo(() => searchParams.get("accessToken") || "", [searchParams]);
  const roleFromQuery = useMemo(() => searchParams.get("role") || "", [searchParams]);

  useEffect(() => {
    if (!accessToken) {
      setError("Missing access token");
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
      setError(e.message || "OAuth login failed");
    });
  }, [accessToken, roleFromQuery, router]);

  return (
    <div className="auth-wrapper">
      <div className="auth-card stack">
        <strong>Signing you in…</strong>
        {error && <div className="alert alert-error">{error}</div>}
      </div>
    </div>
  );
}

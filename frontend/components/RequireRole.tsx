"use client";

import { ReactNode, useEffect, useState } from "react";
import { apiFetch, getToken } from "../lib/api";

type Props = {
  roles: Array<"ADMIN" | "TEACHER" | "USER">;
  children: ReactNode;
};

export const RequireRole = ({ roles, children }: Props) => {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      globalThis.location.href = "/auth/login";
      return;
    }

    apiFetch<{ id: string; role: string }>("/users/me")
      .then((res) => {
        if (res.data && roles.includes(res.data.role as Props["roles"][number])) {
          setAllowed(true);
        } else {
          globalThis.location.href = "/auth/login";
        }
      })
      .catch(() => {
        globalThis.location.href = "/auth/login";
      })
      .finally(() => setLoading(false));
  }, [roles]);

  if (loading) {
    return <div className="container"><p className="muted">Loading...</p></div>;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
};

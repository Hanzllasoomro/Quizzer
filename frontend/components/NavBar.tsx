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
    <div className="topbar">
      <Link href="/" className="inline">
        <strong>Quiz App</strong>
      </Link>
      <div className="actions">
        {!hasToken && (
          <>
            <Link href="/auth/login" className="btn btn-outline">
              Login
            </Link>
            <Link href="/auth/signup" className="btn btn-outline">
              Signup
            </Link>
          </>
        )}
        {hasToken && (
          <>
            <span className="badge">Profile</span>
            <button
              className="btn btn-outline"
              onClick={() => {
                clearToken();
                globalThis.location.href = "/auth/login";
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

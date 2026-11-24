"use client";

import { useActionState } from "react";
import { adminLogin } from "./actions";
import { Button } from "@/components/ui/Button";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState(adminLogin, null);
  const error = state?.error ?? notice;
  return (
    <form action={action} style={{ display: "grid", gap: 12 }}>
      <label htmlFor="secret" style={{ fontWeight: 700, fontSize: 14 }}>
        관리자 비밀번호
      </label>
      <input
        id="secret"
        name="secret"
        type="password"
        autoComplete="current-password"
        required
        style={{
          padding: "15px 16px",
          borderRadius: 16,
          border: "1px solid var(--line)",
          fontSize: 16,
          fontFamily: "var(--font-body)",
        }}
      />
      {error ? (
        <p role="alert" style={{ margin: 0, color: "#B91C1C", fontSize: 14 }}>
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} style={{ width: "100%" }}>
        {pending ? "확인 중…" : "들어가기"}
      </Button>
    </form>
  );
}

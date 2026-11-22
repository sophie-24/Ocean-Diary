"use client";

import { useState } from "react";
import { type } from "@/theme/typography";
import { colors } from "@/theme/tokens";

export function SignupCTA() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErr("이메일 주소를 다시 확인해주세요.");
      return;
    }
    setErr(null);
    setState("loading");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) throw new Error("not ok");
      setState("sent");
    } catch {
      setState("error");
      setErr("잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <section
      id="signup"
      style={{
        backgroundColor: colors.oceanBlue,
        color: colors.white,
        padding: "160px clamp(24px, 6vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-15%",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.14), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: 60,
          alignItems: "center",
        }}
        className="signup-grid"
      >
        <div>
          <p style={{ ...type.label, color: colors.sky, margin: 0 }}>
            사전 등록
          </p>
          <h2 style={{ ...type.h1, color: colors.white, margin: "22px 0 18px", lineHeight: 1.1 }}>
            Mola 출시하면
            <br />
            가장 먼저 알려드릴게요.
          </h2>
          <p style={{ ...type.lead, color: colors.sky, margin: 0, maxWidth: 520, opacity: 0.9 }}>
            이메일 주소만 남겨주세요. 출시일에 다운로드 링크 딱 한 번.
            광고도, 뉴스레터도, 스팸도 없어요.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 28,
            padding: "40px 32px",
          }}
        >
          {state === "sent" ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <p style={{ ...type.h3, color: colors.white, margin: "0 0 10px" }}>
                🌊 받았어요
              </p>
              <p style={{ ...type.body, color: colors.sky, margin: 0, opacity: 0.9 }}>
                출시일에 뵙겠습니다.
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label
                htmlFor="email"
                style={{
                  ...type.label,
                  color: colors.sky,
                  margin: "0 0 12px",
                  display: "block",
                  opacity: 0.85,
                }}
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={state === "loading"}
                style={{
                  width: "100%",
                  padding: "18px 20px",
                  borderRadius: 14,
                  border: "none",
                  outline: "none",
                  fontSize: 17,
                  fontFamily: "var(--font-body)",
                  color: colors.navy,
                  backgroundColor: colors.white,
                  marginBottom: 14,
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                disabled={state === "loading"}
                style={{
                  width: "100%",
                  padding: "18px 24px",
                  borderRadius: 14,
                  border: "none",
                  backgroundColor: colors.navy,
                  color: colors.white,
                  fontFamily: "var(--font-body)",
                  fontWeight: 800,
                  fontSize: 17,
                  letterSpacing: "-0.005em",
                  cursor: state === "loading" ? "wait" : "pointer",
                  opacity: state === "loading" ? 0.7 : 1,
                }}
              >
                {state === "loading" ? "보내는 중…" : "출시 연락받기 →"}
              </button>
              {err ? (
                <p style={{ ...type.caption, color: "#FFD4CC", margin: "12px 0 0" }}>
                  {err}
                </p>
              ) : null}
              <p style={{ ...type.caption, color: colors.sky, margin: "16px 0 0", opacity: 0.7 }}>
                개인정보는 출시 안내 1회 발송 외 어떤 용도로도 사용하지 않아요.
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .signup-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}

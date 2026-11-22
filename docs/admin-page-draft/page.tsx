"use client";

import { useCallback, useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Stats {
  generated_at: string;
  users: { total: number | null; today: number | null; last_7d: number | null; last_30d: number | null };
  observations: { total: number; last_7d: number; unique_species: number };
  dive_logs: { total: number; last_7d: number };
  photos: { total: number };
  identification: { total: number; succeeded: number; failed: number; success_rate: number };
  species_catalog: { total_active: number };
  site_stamps: { total: number };
  active_users: { last_7d: number };
  top_species: { name_ko: string; scientific_name: string; count: number }[];
  dau_14d: { date: string; dau: number }[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/v1/admin/stats`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.code ?? `HTTP ${res.status}`);
      }
      const data: Stats = await res.json();
      setStats(data);
      setAuthed(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  /* Auto-refresh every 60 s while authenticated */
  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => void fetchStats(token), 60_000);
    return () => clearInterval(id);
  }, [authed, token, fetchStats]);

  /* ---------------------------------------------------------------- */
  /*  Login form                                                       */
  /* ---------------------------------------------------------------- */
  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F4F8FC]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void fetchStats(token);
          }}
          className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow-sm"
        >
          <h1 className="text-lg font-semibold text-[#1C1C1E]">Mola 관리자</h1>
          <input
            type="password"
            placeholder="관리자 토큰"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-lg border border-[#E5E5EA] px-4 py-2.5 text-sm
                       placeholder:text-[#AEAEB2] focus:border-[#2563EB] focus:outline-none"
          />
          {error && <p className="text-sm text-[#DC2626]">{error}</p>}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-lg bg-[#2563EB] py-2.5 text-sm font-medium text-white
                       transition hover:bg-[#1d4ed8] disabled:opacity-40"
          >
            {loading ? "확인 중…" : "로그인"}
          </button>
        </form>
      </main>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Dashboard                                                        */
  /* ---------------------------------------------------------------- */
  if (!stats) return null;

  const dauMax = Math.max(...stats.dau_14d.map((d) => d.dau), 1);

  return (
    <main className="min-h-screen bg-[#F4F8FC] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1C1C1E]">Mola 관리자 통계</h1>
          <span className="text-xs text-[#AEAEB2]">
            {new Date(stats.generated_at).toLocaleString("ko-KR")}
          </span>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card label="총 사용자" value={stats.users.total} />
          <Card label="오늘 가입" value={stats.users.today} />
          <Card label="7일 가입" value={stats.users.last_7d} />
          <Card label="30일 가입" value={stats.users.last_30d} />
          <Card label="총 관찰 기록" value={stats.observations.total} />
          <Card label="7일 관찰" value={stats.observations.last_7d} />
          <Card label="발견 종 수" value={stats.observations.unique_species} />
          <Card label="7일 활성 사용자" value={stats.active_users.last_7d} />
          <Card label="총 다이브 로그" value={stats.dive_logs.total} />
          <Card label="7일 다이브" value={stats.dive_logs.last_7d} />
          <Card label="사진 업로드" value={stats.photos.total} />
          <Card label="명소 도장" value={stats.site_stamps.total} />
        </div>

        {/* AI identification */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#1C1C1E]">AI 식별</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniCard label="총 요청" value={stats.identification.total} />
            <MiniCard label="성공" value={stats.identification.succeeded} color="#16A34A" />
            <MiniCard label="실패" value={stats.identification.failed} color="#DC2626" />
            <MiniCard label="성공률" value={`${stats.identification.success_rate}%`} />
          </div>
        </section>

        {/* DAU chart */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#1C1C1E]">
            일별 활성 사용자 (14일)
          </h2>
          <div className="flex items-end gap-1" style={{ height: 120 }}>
            {stats.dau_14d.map((d) => (
              <div key={d.date} className="group relative flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t bg-[#2563EB] transition-colors group-hover:bg-[#1d4ed8]"
                  style={{
                    height: `${Math.max((d.dau / dauMax) * 100, 4)}%`,
                    minHeight: 4,
                  }}
                />
                <span className="mt-1 text-[9px] text-[#AEAEB2]">
                  {d.date.slice(5)}
                </span>
                {/* Tooltip */}
                <span
                  className="pointer-events-none absolute -top-6 rounded bg-[#1C1C1E] px-1.5 py-0.5
                             text-[10px] text-white opacity-0 transition group-hover:opacity-100"
                >
                  {d.dau}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Top species */}
        {stats.top_species.length > 0 && (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-[#1C1C1E]">
              가장 많이 발견된 종 (상위 10)
            </h2>
            <div className="space-y-2">
              {stats.top_species.map((s, i) => (
                <div
                  key={s.scientific_name}
                  className="flex items-center justify-between rounded-lg bg-[#F0F4FA] px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[#AEAEB2]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#1C1C1E]">
                        {s.name_ko}
                      </p>
                      <p className="text-xs text-[#6B6B6F]">
                        {s.scientific_name}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#2563EB]">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Species catalog info */}
        <div className="text-center text-xs text-[#AEAEB2]">
          도감 등록 종: {stats.species_catalog.total_active}종
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Card({ label, value }: { label: string; value: number | string | null }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-[#6B6B6F]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#1C1C1E]">
        {value ?? "—"}
      </p>
    </div>
  );
}

function MiniCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="rounded-lg bg-[#F0F4FA] px-3 py-2">
      <p className="text-[11px] text-[#6B6B6F]">{label}</p>
      <p
        className="mt-0.5 text-lg font-bold"
        style={{ color: color ?? "#1C1C1E" }}
      >
        {value}
      </p>
    </div>
  );
}

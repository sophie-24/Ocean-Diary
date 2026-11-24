import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LoginForm } from "./LoginForm";
import { API_BASE } from "./api-base";
import { AdminNav } from "./ui";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Mola 관리자",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type Stats = {
  generated_at: string;
  users: { total: number; today: number; last_7d: number; last_30d: number };
  observations: { total: number; last_7d: number; unique_species: number };
  dive_logs: { total: number; last_7d: number };
  photos: { total: number };
  identification: { total: number; succeeded: number; failed: number; success_rate: number };
  species_catalog: { total_active: number };
  site_stamps: { total: number };
  active_users: { last_7d: number };
  top_species: { name_ko: string | null; scientific_name: string | null; count: number }[];
  dau_14d: { date: string; dau: number }[];
};

const nf = new Intl.NumberFormat("ko-KR");

type SignupsSummary = { total: number; not_notified: number };

async function load(secret: string): Promise<{ stats?: Stats; signups?: SignupsSummary; error?: string; authFailed?: boolean }> {
  try {
    const res = await fetch(`${API_BASE()}/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    if (res.status === 401) return { authFailed: true };
    if (!res.ok) return { error: `API 오류 (${res.status})` };
    const stats = (await res.json()) as Stats;

    // 사전등록 요약도 함께 로드
    let signups: SignupsSummary | undefined;
    try {
      const sr = await fetch(`${API_BASE()}/v1/admin/signups?limit=0`, {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      });
      if (sr.ok) {
        const sd = await sr.json();
        signups = { total: sd.total ?? 0, not_notified: sd.not_notified ?? 0 };
      }
    } catch { /* 사전등록 테이블 없어도 대시보드는 정상 작동 */ }

    return { stats, signups };
  } catch {
    return { error: "API 서버에 연결할 수 없어요." };
  }
}

export default async function AdminPage() {
  const secret = (await cookies()).get("mola_admin")?.value;
  const result = secret ? await load(secret) : null;

  if (!result || result.authFailed) {
    return (
      <Shell>
        <Card style={{ maxWidth: 380, margin: "12vh auto 0" }}>
          <h1 style={{ margin: "0 0 20px", fontSize: 24 }}>Mola 관리자</h1>
          <LoginForm notice={result?.authFailed ? "세션이 만료됐어요. 다시 입력해주세요." : undefined} />
        </Card>
      </Shell>
    );
  }

  if (!result.stats) {
    return (
      <Shell>
        <Card style={{ maxWidth: 480, margin: "12vh auto 0" }}>
          <p style={{ margin: 0 }}>{result.error}</p>
        </Card>
      </Shell>
    );
  }

  const s = result.stats;
  const maxDau = Math.max(1, ...s.dau_14d.map((d) => d.dau));
  const rate = Math.round(s.identification.success_rate * (s.identification.success_rate <= 1 ? 100 : 1));

  return (
    <Shell>
      <AdminNav active="/admin" />
      <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 13 }}>
        {new Date(s.generated_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })} 기준 · 새로고침하면 갱신돼요 · 카드를 누르면 상세 로그를 볼 수 있어요
      </p>

      <section style={grid}>
        {result.signups ? (
          <Stat href="/admin/signups" label="사전등록" value={result.signups.total} sub={`미발송 ${nf.format(result.signups.not_notified)}명`} />
        ) : null}
        <Stat href="/admin/users" label="전체 가입자" value={s.users.total} sub={`오늘 +${s.users.today} · 7일 +${s.users.last_7d} · 30일 +${s.users.last_30d}`} />
        <Stat label="7일 활성 사용자" value={s.active_users.last_7d} />
        <Stat label="관찰 기록" value={s.observations.total} sub={`최근 7일 ${nf.format(s.observations.last_7d)} · 종 ${nf.format(s.observations.unique_species)}`} />
        <Stat label="다이브 로그" value={s.dive_logs.total} sub={`최근 7일 ${nf.format(s.dive_logs.last_7d)}`} />
        <Stat label="사진" value={s.photos.total} />
        <Stat href="/admin/identifications" label="AI 식별" value={s.identification.total} sub={`성공 ${s.identification.succeeded} · 실패 ${s.identification.failed} · ${rate}%`} />
        <Stat href="/admin/species" label="도감 종(활성)" value={s.species_catalog.total_active} />
        <Stat label="다이브 사이트 스탬프" value={s.site_stamps.total} />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 16 }}>
        <Card>
          <h2 style={h2}>일일 활성 사용자 (14일)</h2>
          <div role="img" aria-label="최근 14일 일일 활성 사용자 막대 그래프" style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140, marginTop: 20 }}>
            {s.dau_14d.map((d) => (
              <div key={d.date} title={`${d.date}: ${d.dau}명`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ height: `${(d.dau / maxDau) * 100}%`, minHeight: 3, background: d.dau ? "var(--blue-600)" : "var(--line)", borderRadius: 6 }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-2)", marginTop: 8 }}>
            <span>{s.dau_14d[0]?.date.slice(5)}</span>
            <span>{s.dau_14d[s.dau_14d.length - 1]?.date.slice(5)}</span>
          </div>
        </Card>

        <Card>
          <h2 style={h2}>많이 기록된 종 TOP 10</h2>
          {s.top_species.length === 0 ? (
            <p style={{ color: "var(--ink-2)", margin: "16px 0 0" }}>아직 기록이 없어요.</p>
          ) : (
            <ol style={{ margin: "16px 0 0", paddingLeft: 22, display: "grid", gap: 10 }}>
              {s.top_species.map((t) => (
                <li key={t.scientific_name ?? t.name_ko}>
                  <strong>{t.name_ko ?? t.scientific_name}</strong>{" "}
                  <span style={{ color: "var(--ink-2)", fontSize: 13 }}>
                    {t.scientific_name} · {nf.format(t.count)}회
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </section>
    </Shell>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginTop: 28,
} as const;
const h2 = { margin: 0, fontSize: 16, fontWeight: 700 } as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", background: "var(--sky)", padding: "32px clamp(16px, 4vw, 48px) 64px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>{children}</div>
    </main>
  );
}

function Stat({ label, value, sub, href }: { label: string; value: number; sub?: string; href?: string }) {
  const card = (
    <Card padding={22} style={href ? { height: "100%", boxSizing: "border-box" } : undefined}>
      <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: "8px 0 0", fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>{nf.format(value)}</p>
      {sub ? <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "var(--ink-2)" }}>{sub}</p> : null}
      {href ? <p style={{ margin: "10px 0 0", fontSize: 13, fontWeight: 700, color: "var(--blue-600)" }}>자세히 보기 →</p> : null}
    </Card>
  );
  return href ? (
    <a href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      {card}
    </a>
  ) : (
    card
  );
}

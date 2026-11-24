import { adminFetch } from "../client";
import { AdminShell, Badge, Empty, ErrorCard, Pager, TableCard, fmt, td, th } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI 식별 로그 · Mola 관리자", robots: { index: false, follow: false } };

type Row = {
  id: string; user_id: string; email: string | null; status: string; provider: string | null;
  model_version: string | null; error_code: string | null; created_at: string | null;
  duration_ms: number | null; top_species: string | null; top_confidence: string | null; top_score: number | null;
};
const PAGE = 30;

export default async function IdentificationsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const qs = new URLSearchParams({ limit: String(PAGE), offset: String((page - 1) * PAGE) });
  if (sp.status) qs.set("status", sp.status);
  const { status, data } = await adminFetch<{ total: number; statuses: string[]; items: Row[] }>(`/v1/admin/identifications?${qs}`);

  const chip = (active: boolean) => ({
    padding: "7px 14px", borderRadius: 999, fontSize: 13.5, fontWeight: 700, textDecoration: "none",
    border: "1px solid var(--line)", background: active ? "var(--blue-600)" : "#fff", color: active ? "#fff" : "var(--ink)",
  });

  return (
    <AdminShell active="/admin/identifications" title="AI 식별 로그" subtitle="사진 식별 요청 한 건당 한 줄이에요. 사진 자체는 보지 않아요.">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <a href="/admin/identifications" style={chip(!sp.status)}>전체</a>
        {(data?.statuses ?? []).map((s) => (
          <a key={s} href={`/admin/identifications?status=${s}`} style={chip(sp.status === s)}>{s}</a>
        ))}
      </div>
      {!data ? (
        <ErrorCard>목록을 불러오지 못했어요. (상태 {status})</ErrorCard>
      ) : (
        <>
          <TableCard>
            <thead>
              <tr>{["시각", "사용자", "상태", "1순위 결과", "신뢰도", "제공자 / 모델", "소요", "오류"].map((h) => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? <Empty>식별 기록이 없어요.</Empty> : null}
              {data.items.map((j) => (
                <tr key={j.id}>
                  <td style={td}>{fmt(j.created_at)}</td>
                  <td style={td}><a href={`/admin/users/${j.user_id}`} style={{ color: "var(--blue-600)", fontWeight: 600 }}>{j.email ?? j.user_id.slice(0, 8)}</a></td>
                  <td style={td}><Badge kind={j.status}>{j.status}</Badge></td>
                  <td style={td}>{j.top_species ?? "—"}</td>
                  <td style={td}>{j.top_confidence ?? "—"}{j.top_score != null ? ` (${j.top_score.toFixed(2)})` : ""}</td>
                  <td style={td}>{j.provider ?? "—"}{j.model_version ? ` / ${j.model_version}` : ""}</td>
                  <td style={td}>{j.duration_ms != null ? `${(j.duration_ms / 1000).toFixed(1)}초` : "—"}</td>
                  <td style={td}>{j.error_code ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </TableCard>
          <Pager basePath="/admin/identifications" query={{ status: sp.status }} page={page} pageSize={PAGE} total={data.total} />
        </>
      )}
    </AdminShell>
  );
}

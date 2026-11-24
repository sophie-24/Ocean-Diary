import { adminFetch } from "../../client";
import { AdminShell, Badge, Empty, ErrorCard, TableCard, fmt, td, th } from "../../ui";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";
export const metadata = { title: "가입자 상세 · Mola 관리자", robots: { index: false, follow: false } };

type Detail = {
  id: string; email: string | null; nickname: string | null; provider: string | null;
  created_at: string | null; last_sign_in_at: string | null;
  dive_logs: { kind: string; seq: number; dive_date: string; region: string; point: string; is_draft: boolean; created_at: string | null }[];
  observations: { species: string | null; identified_by: string; observed_at: string | null; region: string | null; created_at: string | null }[];
  identifications: { id: string; status: string; provider: string | null; error_code: string | null; created_at: string | null }[];
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, data } = await adminFetch<Detail>(`/v1/admin/users/${encodeURIComponent(id)}`);
  if (!data) {
    return (
      <AdminShell active="/admin/users" title="가입자 상세">
        <ErrorCard>{status === 404 ? "가입자를 찾을 수 없어요." : `불러오지 못했어요. (상태 ${status})`}</ErrorCard>
      </AdminShell>
    );
  }
  return (
    <AdminShell
      active="/admin/users"
      title={data.email ?? "(이메일 없음)"}
      subtitle={`가입 ${fmt(data.created_at)} · 마지막 로그인 ${fmt(data.last_sign_in_at)}`}
      actions={<a href="/admin/users" style={{ fontWeight: 600 }}>← 목록</a>}
    >
      <Card style={{ marginBottom: 16 }} padding={20}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", fontSize: 14 }}>
          <span>닉네임 <strong>{data.nickname ?? "—"}</strong></span>
          <span>가입 방식 <strong>{data.provider ?? "—"}</strong></span>
          <span style={{ color: "var(--ink-2)", fontSize: 12.5 }}>ID {data.id}</span>
        </div>
      </Card>

      <h2 style={{ fontSize: 16 }}>최근 다이브 로그</h2>
      <TableCard>
        <thead><tr>{["다이브", "날짜", "지역", "포인트", "상태", "기록 시각"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>
          {data.dive_logs.length === 0 ? <Empty>기록이 없어요.</Empty> : null}
          {data.dive_logs.map((d, i) => (
            <tr key={i}>
              <td style={td}>{d.kind} #{d.seq}</td><td style={td}>{d.dive_date}</td>
              <td style={td}>{d.region}</td><td style={td}>{d.point}</td>
              <td style={td}>{d.is_draft ? <Badge>임시저장</Badge> : <Badge kind="succeeded">저장</Badge>}</td>
              <td style={td}>{fmt(d.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>최근 관찰 기록</h2>
      <TableCard>
        <thead><tr>{["종", "식별 방식", "관찰 시각", "지역", "기록 시각"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>
          {data.observations.length === 0 ? <Empty>기록이 없어요.</Empty> : null}
          {data.observations.map((o, i) => (
            <tr key={i}>
              <td style={td}>{o.species ?? "미확인"}</td><td style={td}>{o.identified_by}</td>
              <td style={td}>{fmt(o.observed_at)}</td><td style={td}>{o.region ?? "—"}</td><td style={td}>{fmt(o.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      <h2 style={{ fontSize: 16, marginTop: 28 }}>최근 AI 식별</h2>
      <TableCard>
        <thead><tr>{["시각", "상태", "제공자", "오류 코드"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>
          {data.identifications.length === 0 ? <Empty>기록이 없어요.</Empty> : null}
          {data.identifications.map((j) => (
            <tr key={j.id}>
              <td style={td}>{fmt(j.created_at)}</td><td style={td}><Badge kind={j.status}>{j.status}</Badge></td>
              <td style={td}>{j.provider ?? "—"}</td><td style={td}>{j.error_code ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </AdminShell>
  );
}

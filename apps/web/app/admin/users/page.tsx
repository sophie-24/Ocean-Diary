import { adminFetch } from "../client";
import { AdminShell, Badge, Empty, ErrorCard, Pager, SearchBar, TableCard, fmt, td, th } from "../ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "가입자 · Mola 관리자", robots: { index: false, follow: false } };

type Row = {
  id: string; email: string | null; nickname: string | null; provider: string | null;
  created_at: string | null; last_sign_in_at: string | null;
  dive_logs: number; observations: number; identifications: number;
};
const PAGE = 30;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const qs = new URLSearchParams({ limit: String(PAGE), offset: String((page - 1) * PAGE) });
  if (sp.q) qs.set("q", sp.q);
  const { status, data } = await adminFetch<{ total: number; items: Row[] }>(`/v1/admin/users?${qs}`);

  return (
    <AdminShell active="/admin/users" title="가입자" subtitle="이메일·가입 방식·활동 개수만 보여요. 일기 본문과 사진은 보지 않아요.">
      <SearchBar action="/admin/users" q={sp.q} placeholder="이메일 검색" />
      {!data ? (
        <ErrorCard>목록을 불러오지 못했어요. (상태 {status})</ErrorCard>
      ) : (
        <>
          <TableCard>
            <thead>
              <tr>
                {["가입일", "이메일", "닉네임", "가입 방식", "마지막 로그인", "다이브", "관찰", "AI 식별"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? <Empty>가입자가 없어요.</Empty> : null}
              {data.items.map((u) => (
                <tr key={u.id}>
                  <td style={td}>{fmt(u.created_at)}</td>
                  <td style={td}><a href={`/admin/users/${u.id}`} style={{ fontWeight: 700, color: "var(--blue-600)" }}>{u.email ?? "(이메일 없음)"}</a></td>
                  <td style={td}>{u.nickname ?? "—"}</td>
                  <td style={td}>{u.provider ? <Badge>{u.provider}</Badge> : "—"}</td>
                  <td style={td}>{fmt(u.last_sign_in_at)}</td>
                  <td style={td}>{u.dive_logs}</td>
                  <td style={td}>{u.observations}</td>
                  <td style={td}>{u.identifications}</td>
                </tr>
              ))}
            </tbody>
          </TableCard>
          <Pager basePath="/admin/users" query={{ q: sp.q }} page={page} pageSize={PAGE} total={data.total} />
        </>
      )}
    </AdminShell>
  );
}

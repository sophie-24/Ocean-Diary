import type { Metadata } from "next";
import { adminFetch } from "../client";
import { AdminShell, TableCard, th, td, Empty, Pager, SearchBar, ErrorCard, fmt, Badge } from "../ui";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "사전등록 · Mola 관리자",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type SignupItem = {
  id: string;
  email: string;
  source: string;
  signed_up_at: string | null;
  notified_at: string | null;
};
type SignupsResult = {
  total: number;
  not_notified: number;
  items: SignupItem[];
};

const PAGE_SIZE = 50;
const nf = new Intl.NumberFormat("ko-KR");

export default async function SignupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { data, status } = await adminFetch<SignupsResult>(
    `/v1/admin/signups?limit=${PAGE_SIZE}&offset=${offset}${q ? `&q=${encodeURIComponent(q)}` : ""}`
  );

  if (!data || status === 0) {
    return (
      <AdminShell active="/admin/signups" title="사전등록">
        <ErrorCard>API 서버에 연결할 수 없어요.</ErrorCard>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      active="/admin/signups"
      title="출시 사전등록"
      subtitle={`전체 ${nf.format(data.total)}명 · 미발송 ${nf.format(data.not_notified)}명`}
      actions={
        <a
          href={`${process.env.ADMIN_API_BASE_URL || "http://127.0.0.1:8001"}/v1/admin/signups/export`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Button variant="ghost" size="md">
            CSV 내보내기 ↓
          </Button>
        </a>
      }
    >
      <SearchBar action="/admin/signups" q={q} placeholder="이메일 검색" />

      <TableCard>
        <thead>
          <tr>
            <th style={th}>#</th>
            <th style={th}>이메일</th>
            <th style={th}>경로</th>
            <th style={th}>등록일</th>
            <th style={th}>알림 발송</th>
          </tr>
        </thead>
        <tbody>
          {data.items.length === 0 ? (
            <Empty>사전등록 데이터가 없어요.</Empty>
          ) : (
            data.items.map((item, i) => (
              <tr key={item.id}>
                <td style={{ ...td, color: "var(--ink-2)", fontSize: 13 }}>
                  {offset + i + 1}
                </td>
                <td style={{ ...td, fontWeight: 600 }}>{item.email}</td>
                <td style={td}>
                  <Badge>{item.source}</Badge>
                </td>
                <td style={{ ...td, fontSize: 13, color: "var(--ink-2)" }}>
                  {fmt(item.signed_up_at)}
                </td>
                <td style={td}>
                  {item.notified_at ? (
                    <Badge kind="succeeded">발송 완료</Badge>
                  ) : (
                    <Badge kind="queued">미발송</Badge>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </TableCard>

      <Pager
        basePath="/admin/signups"
        query={{ q: q || undefined }}
        page={page}
        pageSize={PAGE_SIZE}
        total={data.total}
      />
    </AdminShell>
  );
}

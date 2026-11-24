import { adminFetch } from "../client";
import { AdminShell, Badge, Empty, ErrorCard, Pager, SearchBar, TableCard, td, th } from "../ui";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata = { title: "도감 종 · Mola 관리자", robots: { index: false, follow: false } };

type Row = {
  id: string; catalog_no: string | null; common_name_ko: string; common_name_en: string | null;
  scientific_name: string; group_ko: string | null; is_active: boolean; image_url: string | null; observation_count: number;
};
const PAGE = 50;
const NOTICE: Record<string, string> = {
  saved: "저장했어요.",
  deleted: "삭제했어요.",
  deactivated: "사용자 기록이 있는 종이라 삭제 대신 비활성화했어요. (앱 도감에서는 숨겨져요)",
};

export default async function SpeciesPage({ searchParams }: { searchParams: Promise<{ q?: string; group?: string; page?: string; notice?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const qs = new URLSearchParams({ limit: String(PAGE), offset: String((page - 1) * PAGE) });
  if (sp.q) qs.set("q", sp.q);
  if (sp.group) qs.set("group", sp.group);
  const { status, data } = await adminFetch<{ total: number; groups: string[]; items: Row[] }>(`/v1/admin/species?${qs}`);

  return (
    <AdminShell
      active="/admin/species" title="도감 종"
      subtitle="여기서 추가·수정·삭제하면 DB에 바로 반영돼요."
      actions={<Button href="/admin/species/new" size="md">+ 새 종 추가</Button>}
    >
      {sp.notice && NOTICE[sp.notice] ? (
        <p role="status" style={{ background: "#E4F7EE", color: "#1F6B4D", padding: "12px 16px", borderRadius: 14, fontWeight: 600, margin: "0 0 16px" }}>{NOTICE[sp.notice]}</p>
      ) : null}
      <SearchBar action="/admin/species" q={sp.q} placeholder="이름·학명 검색">
        <select name="group" defaultValue={sp.group ?? ""} aria-label="그룹" style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)", fontSize: 15, fontFamily: "var(--font-body)" }}>
          <option value="">전체 그룹</option>
          {(data?.groups ?? []).map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </SearchBar>
      {!data ? (
        <ErrorCard>목록을 불러오지 못했어요. (상태 {status})</ErrorCard>
      ) : (
        <>
          <TableCard>
            <thead><tr>{["이미지", "번호", "한글 이름", "학명", "그룹", "기록 수", "상태", ""].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {data.items.length === 0 ? <Empty>종이 없어요.</Empty> : null}
              {data.items.map((s) => (
                <tr key={s.id}>
                  <td style={td}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--sky)", overflow: "hidden", display: "grid", placeItems: "center" }}>
                      {s.image_url ? <img src={s.image_url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : null}
                    </div>
                  </td>
                  <td style={td}>{s.catalog_no ?? "—"}</td>
                  <td style={td}><strong>{s.common_name_ko}</strong>{s.common_name_en ? <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{s.common_name_en}</div> : null}</td>
                  <td style={{ ...td, fontStyle: "italic" }}>{s.scientific_name}</td>
                  <td style={td}>{s.group_ko ?? "—"}</td>
                  <td style={td}>{s.observation_count}</td>
                  <td style={td}>{s.is_active ? <Badge kind="succeeded">활성</Badge> : <Badge>숨김</Badge>}</td>
                  <td style={td}><a href={`/admin/species/${s.id}`} style={{ fontWeight: 700, color: "var(--blue-600)" }}>수정</a></td>
                </tr>
              ))}
            </tbody>
          </TableCard>
          <Pager basePath="/admin/species" query={{ q: sp.q, group: sp.group }} page={page} pageSize={PAGE} total={data.total} />
        </>
      )}
    </AdminShell>
  );
}

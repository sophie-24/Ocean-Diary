import { adminFetch } from "../../client";
import { AdminShell, ErrorCard } from "../../ui";
import { SpeciesForm } from "../SpeciesForm";
import { DeleteButton } from "../DeleteButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "종 수정 · Mola 관리자", robots: { index: false, follow: false } };

type Item = {
  id: string; common_name_ko: string; scientific_name: string; common_name_en: string | null;
  group_ko: string | null; subgroup_ko: string | null; catalog_no: string | null;
  description_ko: string; is_active: boolean; image_url: string | null; observation_count: number;
};

export default async function EditSpeciesPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { status, data } = await adminFetch<Item>(`/v1/admin/species/${encodeURIComponent(id)}`);
  if (!data) {
    return (
      <AdminShell active="/admin/species" title="종 수정">
        <ErrorCard>{status === 404 ? "종을 찾을 수 없어요." : `불러오지 못했어요. (상태 ${status})`}</ErrorCard>
      </AdminShell>
    );
  }
  return (
    <AdminShell
      active="/admin/species" title={data.common_name_ko}
      subtitle={data.observation_count > 0 ? `사용자 기록 ${data.observation_count}건에서 쓰이는 종이에요.` : undefined}
      actions={<DeleteButton id={data.id} name={data.common_name_ko} observationCount={data.observation_count} />}
    >
      {sp.error === "delete" ? <p role="alert" style={{ color: "#B91C1C", fontWeight: 600 }}>삭제하지 못했어요. 잠시 후 다시 시도해주세요.</p> : null}
      <SpeciesForm v={data} />
    </AdminShell>
  );
}

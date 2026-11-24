import { AdminShell } from "../../ui";
import { SpeciesForm } from "../SpeciesForm";

export const metadata = { title: "새 종 추가 · Mola 관리자", robots: { index: false, follow: false } };

export default function NewSpeciesPage() {
  return (
    <AdminShell active="/admin/species" title="새 종 추가">
      <SpeciesForm
        v={{ id: null, common_name_ko: "", scientific_name: "", common_name_en: null, group_ko: null, subgroup_ko: null, catalog_no: null, description_ko: "", is_active: true, image_url: null }}
      />
    </AdminShell>
  );
}

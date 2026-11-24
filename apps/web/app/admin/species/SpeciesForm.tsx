"use client";

import { useActionState, useState } from "react";
import { saveSpecies, type FormState } from "../species-actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export type SpeciesValues = {
  id: string | null;
  common_name_ko: string; scientific_name: string; common_name_en: string | null;
  group_ko: string | null; subgroup_ko: string | null; catalog_no: string | null;
  description_ko: string; is_active: boolean; image_url: string | null;
};

const input = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)", fontSize: 15, fontFamily: "var(--font-body)", boxSizing: "border-box" } as const;
const label = { display: "grid", gap: 6, fontWeight: 700, fontSize: 13.5 } as const;

export function SpeciesForm({ v }: { v: SpeciesValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSpecies.bind(null, v.id), null);
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? v.image_url;

  return (
    <form action={action}>
      <Card padding={24} style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <label style={label}>한글 이름 *<input name="common_name_ko" required maxLength={100} defaultValue={v.common_name_ko} style={input} /></label>
          <label style={label}>학명 *<input name="scientific_name" required maxLength={200} defaultValue={v.scientific_name} style={input} /></label>
          <label style={label}>영문 이름<input name="common_name_en" maxLength={120} defaultValue={v.common_name_en ?? ""} style={input} /></label>
          <label style={label}>도감 번호 (3자리)<input name="catalog_no" inputMode="numeric" pattern="\d{3}" maxLength={3} defaultValue={v.catalog_no ?? ""} placeholder="비우면 번호 없음" style={input} /></label>
          <label style={label}>그룹<input name="group_ko" maxLength={40} defaultValue={v.group_ko ?? ""} style={input} /></label>
          <label style={label}>하위 그룹<input name="subgroup_ko" maxLength={40} defaultValue={v.subgroup_ko ?? ""} style={input} /></label>
        </div>
        <label style={label}>설명<textarea name="description_ko" rows={4} maxLength={4000} defaultValue={v.description_ko} style={{ ...input, resize: "vertical" }} /></label>

        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 120, height: 120, borderRadius: 20, background: "var(--sky)", border: "1px solid var(--blue-100)", display: "grid", placeItems: "center", overflow: "hidden", color: "var(--ink-2)", fontSize: 12 }}>
            {shown ? <img src={shown} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : "이미지 없음"}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={label}>
              이미지 (PNG/JPG/WEBP, 4MB 이하)
              <input
                type="file" name="image" accept="image/png,image/jpeg,image/webp"
                onChange={(e) => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : null); }}
              />
            </label>
            {v.id && v.image_url ? (
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
                <input type="checkbox" name="remove_image" /> 현재 이미지 삭제
              </label>
            ) : null}
          </div>
        </div>

        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
          <input type="checkbox" name="is_active" defaultChecked={v.is_active} /> 앱 도감에 보이기 (활성)
        </label>

        {state?.error ? <p role="alert" style={{ margin: 0, color: "#B91C1C", fontSize: 14 }}>{state.error}</p> : null}
        <div style={{ display: "flex", gap: 10 }}>
          <Button type="submit" size="md" disabled={pending}>{pending ? "저장 중…" : v.id ? "저장" : "추가"}</Button>
          <Button href="/admin/species" variant="ghost" size="md">취소</Button>
        </div>
      </Card>
    </form>
  );
}

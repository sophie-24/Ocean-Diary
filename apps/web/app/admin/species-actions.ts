"use server";

import { redirect } from "next/navigation";
import { adminFetch } from "./client";

export type FormState = { error?: string } | null;

const MAX_IMAGE = 4 * 1024 * 1024;
const ERRORS: Record<string, string> = {
  INVALID_IMAGE: "이미지를 읽을 수 없어요. PNG/JPG/WEBP 파일인지 확인해주세요.",
  IMAGE_TOO_LARGE: "이미지가 너무 커요. 4MB 이하로 올려주세요.",
  SPECIES_CONFLICT: "도감 번호가 이미 다른 종에 쓰이고 있어요.",
  STORAGE_ERROR: "이미지 저장소에 연결하지 못했어요. API 서버의 스토리지(MinIO/S3) 설정을 확인해주세요.",
};

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const optional = (f: FormData, k: string) => text(f, k) || null;

/** 새 종(id=null) 추가 또는 기존 종 수정. */
export async function saveSpecies(id: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const body: Record<string, unknown> = {
    common_name_ko: text(form, "common_name_ko"),
    scientific_name: text(form, "scientific_name"),
    description_ko: text(form, "description_ko"),
    common_name_en: optional(form, "common_name_en"),
    group_ko: optional(form, "group_ko"),
    subgroup_ko: optional(form, "subgroup_ko"),
    catalog_no: optional(form, "catalog_no"),
    is_active: form.get("is_active") === "on",
    remove_image: form.get("remove_image") === "on",
  };
  if (!body.common_name_ko || !body.scientific_name) return { error: "한글 이름과 학명은 꼭 필요해요." };
  if (body.catalog_no && !/^\d{3}$/.test(String(body.catalog_no))) return { error: "도감 번호는 숫자 3자리예요. (예: 042)" };

  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE) return { error: ERRORS.IMAGE_TOO_LARGE };
    if (!file.type.startsWith("image/")) return { error: ERRORS.INVALID_IMAGE };
    body.image_base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  }

  const { status, data } = await adminFetch<{ detail?: { code?: string } }>(
    id ? `/v1/admin/species/${id}` : "/v1/admin/species",
    { method: id ? "PUT" : "POST", body },
  );
  if (status === 200 || status === 201) redirect("/admin/species?notice=saved");
  const code = data?.detail?.code;
  if (code && ERRORS[code]) return { error: ERRORS[code] };
  if (status === 422) return { error: "입력값을 확인해주세요. (글자 수 제한을 넘었을 수 있어요)" };
  if (status === 0) return { error: "API 서버에 연결할 수 없어요." };
  return { error: `저장하지 못했어요. (상태 ${status})` };
}

/** 삭제. 관찰 기록이 참조 중이면 서버가 비활성화로 처리한다. */
export async function deleteSpecies(id: string): Promise<void> {
  const { status, data } = await adminFetch<{ result?: string }>(`/v1/admin/species/${id}`, { method: "DELETE" });
  if (status === 200) redirect(`/admin/species?notice=${data?.result === "deactivated" ? "deactivated" : "deleted"}`);
  redirect(`/admin/species/${id}?error=delete`);
}

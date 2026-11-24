"use client";

import { deleteSpecies } from "../species-actions";
import { Button } from "@/components/ui/Button";

export function DeleteButton({ id, name, observationCount }: { id: string; name: string; observationCount: number }) {
  const msg = observationCount > 0
    ? `"${name}"은(는) 사용자 기록 ${observationCount}건이 있어 삭제 대신 비활성화(앱에서 숨김)돼요. 진행할까요?`
    : `"${name}"을(를) 완전히 삭제할까요? 되돌릴 수 없어요.`;
  return (
    <form
      action={deleteSpecies.bind(null, id)}
      onSubmit={(e) => { if (!window.confirm(msg)) e.preventDefault(); }}
    >
      <Button type="submit" variant="danger" size="md">{observationCount > 0 ? "비활성화" : "삭제"}</Button>
    </form>
  );
}

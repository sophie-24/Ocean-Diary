import { createClient } from "@supabase/supabase-js";

/**
 * 서버사이드 전용 Supabase 클라이언트 (service_role 키 사용).
 * API route에서만 사용 — 클라이언트에 노출 금지.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

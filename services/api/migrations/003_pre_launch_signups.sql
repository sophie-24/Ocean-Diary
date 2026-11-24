-- 사전 등록 이메일 수집 테이블
-- Supabase 대시보드 SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS pre_launch_signups (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email       text NOT NULL,
  source      text NOT NULL DEFAULT 'mola.app',
  signed_up_at timestamptz NOT NULL DEFAULT now(),
  notified_at  timestamptz,  -- 출시 알림 발송 시각 (null이면 미발송)
  
  CONSTRAINT email_unique UNIQUE (email)
);

-- 인덱스: 미발송 목록 조회용
CREATE INDEX IF NOT EXISTS idx_signups_not_notified 
  ON pre_launch_signups (signed_up_at) 
  WHERE notified_at IS NULL;

-- RLS: 서비스 롤만 접근 (anon/authenticated 차단)
ALTER TABLE pre_launch_signups ENABLE ROW LEVEL SECURITY;

-- 서비스 롤에만 모든 권한
CREATE POLICY "service_role_all" ON pre_launch_signups
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

import { type } from "@/theme/typography";
import { colors } from "@/theme/tokens";

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: colors.deepSea,
        color: colors.sky,
        padding: "clamp(64px, 9vw, 96px) clamp(20px, 6vw, 80px) 48px",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)",
          gap: 48,
          marginBottom: 72,
        }}
        className="footer-grid"
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <img src="/brand/mola-icon.png" alt="Mola" width={52} height={52} style={{ borderRadius: 12 }} />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 800,
                fontSize: 36,
                letterSpacing: "-0.03em",
                color: colors.white,
              }}
            >
              Mola
            </span>
          </div>
          <p style={{ ...type.body, color: colors.sky, margin: 0, maxWidth: 340, opacity: 0.8 }}>
            다이빙에서 만난 바다 친구들을 수채화 그림일기와 도감으로 남기는 앱.
          </p>
          <p style={{ ...type.caption, color: colors.sky, margin: "20px 0 0", opacity: 0.55 }}>
            2026년 겨울 iOS / Android 출시 예정
          </p>
        </div>

        <FooterCol heading="팔로우">
          <FooterLink href="https://instagram.com/molamola_log">Instagram</FooterLink>
          <FooterLink href="https://threads.net/@molamola_log">Threads</FooterLink>
        </FooterCol>

        <FooterCol heading="법적 고지">
          <FooterLink href="/legal/privacy">개인정보 처리방침</FooterLink>
          <FooterLink href="/legal/terms">이용약관</FooterLink>
        </FooterCol>
      </div>

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          paddingTop: 32,
          borderTop: "1px solid rgba(220,235,252,0.14)",
        }}
      >
        <p style={{ ...type.caption, color: colors.sky, margin: 0, opacity: 0.55 }}>
          © 2026 Mola
        </p>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </footer>
  );
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <nav aria-label={heading}>
      <h3 style={{ ...type.label, color: colors.oceanBlue, margin: "0 0 16px" }}>
        {heading}
      </h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>{children}</ul>
    </nav>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li style={{ marginBottom: 12 }}>
      <a
        href={href}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          color: colors.sky,
          textDecoration: "none",
          opacity: 0.8,
        }}
      >
        {children}
      </a>
    </li>
  );
}

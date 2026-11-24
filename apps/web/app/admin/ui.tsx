import type { CSSProperties, ReactNode } from "react";
import { adminLogout } from "./actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const LINKS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/users", label: "가입자" },
  { href: "/admin/identifications", label: "AI 식별" },
  { href: "/admin/species", label: "도감 종" },
];

export function AdminNav({ active }: { active?: string }) {
  return (
    <nav
      aria-label="관리자 메뉴"
      style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 24 }}
    >
      <strong style={{ marginRight: 12, fontSize: 18 }}>Mola 관리자</strong>
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          style={{
            padding: "8px 14px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            color: active === l.href ? "#fff" : "var(--ink)",
            background: active === l.href ? "var(--blue-600)" : "transparent",
          }}
        >
          {l.label}
        </a>
      ))}
      <form action={adminLogout} style={{ marginLeft: "auto" }}>
        <Button type="submit" variant="ghost" size="md">
          로그아웃
        </Button>
      </form>
    </nav>
  );
}

export function AdminShell({
  active,
  title,
  subtitle,
  actions,
  children,
}: {
  active: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main style={{ minHeight: "100vh", background: "var(--sky)", padding: "28px clamp(16px, 4vw, 48px) 64px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <AdminNav active={active} />
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>{title}</h1>
            {subtitle ? <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: 14 }}>{subtitle}</p> : null}
          </div>
          {actions}
        </header>
        {children}
      </div>
    </main>
  );
}

export function TableCard({ children }: { children: ReactNode }) {
  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>{children}</table>
      </div>
    </Card>
  );
}

export const th: CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: 12.5,
  color: "var(--ink-2)",
  fontWeight: 700,
  borderBottom: "1px solid var(--line)",
  whiteSpace: "nowrap",
  background: "#FAFCFF",
};
export const td: CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid var(--line)",
  verticalAlign: "middle",
};

export function Empty({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td colSpan={20} style={{ ...td, textAlign: "center", color: "var(--ink-2)", padding: 32 }}>
        {children}
      </td>
    </tr>
  );
}

export function Pager({
  basePath,
  query,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  query: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const linkStyle: CSSProperties = { padding: "8px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, color: "var(--ink)" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, justifyContent: "center" }}>
      {page > 1 ? <a href={href(page - 1)} style={linkStyle}>← 이전</a> : null}
      <span style={{ color: "var(--ink-2)", fontSize: 13 }}>
        {page} / {pages} · 총 {new Intl.NumberFormat("ko-KR").format(total)}건
      </span>
      {page < pages ? <a href={href(page + 1)} style={linkStyle}>다음 →</a> : null}
    </div>
  );
}

export function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const BADGE: Record<string, { bg: string; fg: string }> = {
  succeeded: { bg: "#E4F7EE", fg: "#1F6B4D" },
  failed: { bg: "#FFE9E3", fg: "#B23A22" },
  queued: { bg: "#FFF6D6", fg: "#7A5800" },
  running: { bg: "#DBEAFE", fg: "#1D4ED8" },
};
export function Badge({ children, kind }: { children: ReactNode; kind?: string }) {
  const c = (kind && BADGE[kind]) || { bg: "#EEF2F7", fg: "#4B5563" };
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: c.bg, color: c.fg, fontWeight: 700, fontSize: 12.5 }}>
      {children}
    </span>
  );
}

export function SearchBar({
  action,
  q,
  placeholder,
  children,
}: {
  action: string;
  q?: string;
  placeholder: string;
  children?: ReactNode;
}) {
  return (
    <form action={action} method="get" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
      <input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{ flex: "1 1 240px", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)", fontSize: 15, fontFamily: "var(--font-body)" }}
      />
      {children}
      <Button type="submit" size="md">
        검색
      </Button>
    </form>
  );
}

export function ErrorCard({ children }: { children: ReactNode }) {
  return (
    <Card>
      <p style={{ margin: 0 }}>{children}</p>
    </Card>
  );
}

import Link from "next/link";
import { feedPosts } from "@/data/feedPosts";
import { colors } from "@/theme/tokens";

export const metadata = { title: "Mola · 피드 프리뷰" };

export default function FeedIndexPage() {
  // Group by week for readability.
  const weeks = feedPosts.reduce<Record<string, typeof feedPosts>>(
    (acc, post) => {
      acc[post.week] = acc[post.week] ?? [];
      acc[post.week].push(post);
      return acc;
    },
    {},
  );

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "80px 32px 160px",
        fontFamily: "var(--font-body)",
        color: colors.navy,
      }}
    >
      <header style={{ marginBottom: 56 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: colors.oceanBlue,
            marginBottom: 12,
          }}
        >
          Mola · Instagram feed
        </div>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          피드 프리뷰
        </h1>
        <p
          style={{
            fontSize: 16,
            color: colors.ink2,
            marginTop: 16,
            lineHeight: 1.6,
          }}
        >
          포스트를 클릭하면 1080×1350 캔버스 그대로 보여요. DevTools로 창 크기를
          1080으로 맞추고 영역 스크린샷으로 캡처하거나 각 슬라이드를 PNG로 뽑아
          인스타에 올릴 수 있어요.
        </p>
      </header>

      {Object.entries(weeks).map(([week, posts]) => (
        <section key={week} style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: colors.ink2,
              marginBottom: 16,
              borderBottom: `1px solid ${colors.line}`,
              paddingBottom: 12,
            }}
          >
            {week}
          </h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/preview/feed/${post.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderRadius: 12,
                    background: colors.mist,
                    border: `1px solid ${colors.line}`,
                    color: colors.navy,
                    textDecoration: "none",
                    fontSize: 16,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>
                    <span
                      style={{
                        display: "inline-block",
                        minWidth: 48,
                        color: colors.oceanBlue,
                        fontSize: 13,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {post.day}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        minWidth: 60,
                        color: colors.ink2,
                        fontSize: 13,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {post.pillar}
                    </span>
                    {post.title}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: colors.ink3,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {post.slides.length}장
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

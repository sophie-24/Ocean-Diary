import { notFound } from "next/navigation";
import Link from "next/link";
import { CarouselDeck } from "@/components/feed/CarouselDeck";
import { feedPosts, getPostBySlug } from "@/data/feedPosts";
import { colors } from "@/theme/tokens";

export function generateStaticParams() {
  return feedPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return { title: post ? `Mola · ${post.title}` : "Mola · 피드" };
}

export default async function FeedPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: colors.mist,
        padding: "40px 32px 160px",
        fontFamily: "var(--font-body)",
        color: colors.navy,
      }}
    >
      {/* Breadcrumb + metadata */}
      <div style={{ maxWidth: 1080, margin: "0 auto 32px" }}>
        <Link
          href="/preview/feed"
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: colors.oceanBlue,
            textDecoration: "none",
          }}
        >
          ← 전체 피드로
        </Link>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            margin: "12px 0 8px",
          }}
        >
          {post.title}
        </h1>
        <div
          style={{
            fontSize: 13,
            color: colors.ink3,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {post.week} · {post.day} · {post.pillar} · {post.slides.length}장
        </div>
      </div>

      {/* Slides */}
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <CarouselDeck slides={post.slides} />
      </div>

      {/* Caption + hashtags */}
      <div
        style={{
          maxWidth: 720,
          margin: "72px auto 0",
          padding: 32,
          background: colors.white,
          border: `1px solid ${colors.line}`,
          borderRadius: 16,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: colors.ink2,
            marginBottom: 12,
          }}
        >
          Instagram 캡션
        </div>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            margin: 0,
            color: colors.navy,
          }}
        >
          {post.caption}
        </p>
        {post.hashtags.length > 0 && (
          <p
            style={{
              marginTop: 20,
              fontSize: 14,
              color: colors.oceanBlue,
              lineHeight: 1.6,
            }}
          >
            {post.hashtags.map((t) => `#${t}`).join(" ")}
          </p>
        )}
      </div>
    </main>
  );
}

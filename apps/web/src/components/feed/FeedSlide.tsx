import { CSSProperties, ReactNode } from "react";
import { colors } from "@/theme/tokens";
import { Critter } from "@/components/Critter";
import type { CritterKind } from "@/data/illustrations";

/**
 * Mola Instagram feed slide template — 1080×1350 (4:5).
 *
 * Reusable layout for every carousel post. The template is intentionally
 * rigid so the feed grid reads as one surface:
 *   top:    brand chip + tone line
 *   middle: giant Korean copy (Pretendard Black, 2–3 lines)
 *   bottom: small description, critter illustration, tag + URL
 *
 * Render at exactly 1080×1350 inside the /preview/feed/[slug] route, then
 * screenshot that frame (DevTools device toolbar → 1080×1350 → full-size
 * screenshot) to drop into Instagram.
 *
 * All colors come from theme tokens. `bgColor`/`inkColor` let a post sit in
 * navy, oceanBlue, mist, or any other token color while the rest of the
 * typography scale stays locked.
 */

export type FeedSlideCritter = {
  kind: CritterKind;
  /** Side length in px at 1080×1350. Default 440. */
  size?: number;
  /** Nudge from the bottom-right corner. Default { right: 80, bottom: 160 }. */
  offset?: { right?: number; bottom?: number };
  /** Rotation in degrees. Default 0. */
  rotate?: number;
};

export type FeedSlideProps = {
  /** Small chip in the top-left corner, e.g. "Mola · 오늘의 바다". */
  brandLabel: string;
  /** Soft line under the brand chip, e.g. "사진 한 장이면". */
  toneLine?: string;
  /**
   * The slide's hero copy. Pass each line as a string — the component wraps
   * them in <span> so you control line breaks without CSS wrestling.
   * 2–3 lines is the sweet spot.
   */
  bigCopy: string[];
  /** Soft description under the big copy. Optional. */
  description?: string;
  /** Hand-painted illustration from the critter library. Optional. */
  critter?: FeedSlideCritter;
  /** Bottom-left tag, e.g. "수집 01". */
  tag?: string;
  /** Bottom-right URL, e.g. "mola.app". Default "mola.app". */
  url?: string;
  /** Slide background color token. Default colors.oceanBlue. */
  bgColor?: string;
  /** Main text color. Default white — pass colors.navy for light bg. */
  inkColor?: string;
  /** Soft text color for tone/description. Default rgba(white, 0.78). */
  softInkColor?: string;
  /** Font size override for the big copy. Default 136. */
  copySize?: number;
  /**
   * Alternative children slot to replace the entire middle block (big copy +
   * description). Lets a special-case slide (cover, closing CTA, etc.) break
   * the template without rewriting it.
   */
  middleOverride?: ReactNode;
};

const WIDTH = 1080;
const HEIGHT = 1350;

export function FeedSlide({
  brandLabel,
  toneLine,
  bigCopy,
  description,
  critter,
  tag,
  url = "mola.app",
  bgColor = colors.oceanBlue,
  inkColor = colors.white,
  softInkColor,
  copySize = 136,
  middleOverride,
}: FeedSlideProps) {
  const soft = softInkColor ?? "rgba(255, 255, 255, 0.78)";

  const containerStyle: CSSProperties = {
    width: WIDTH,
    height: HEIGHT,
    background: bgColor,
    color: inkColor,
    position: "relative",
    overflow: "hidden",
    fontFamily: "var(--font-body)",
    // The screenshot frame is positioned, not scaled, so pixel sizes below are
    // exactly what lands in the exported PNG.
  };

  const padX = 88;
  const padY = 88;

  const brandStyle: CSSProperties = {
    position: "absolute",
    top: padY,
    left: padX,
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: soft,
  };

  const toneStyle: CSSProperties = {
    position: "absolute",
    top: padY + 44,
    left: padX,
    fontSize: 34,
    fontWeight: 500,
    letterSpacing: "-0.01em",
    color: soft,
  };

  const bigCopyStyle: CSSProperties = {
    position: "absolute",
    top: 300,
    left: padX,
    right: padX,
    fontSize: copySize,
    fontWeight: 900,
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
    color: inkColor,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };

  const descriptionStyle: CSSProperties = {
    position: "absolute",
    top: 300 + bigCopy.length * copySize * 1.04 + 48,
    left: padX,
    right: padX,
    fontSize: 32,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "-0.005em",
    color: soft,
    maxWidth: 720,
  };

  const tagStyle: CSSProperties = {
    position: "absolute",
    bottom: padY,
    left: padX,
    fontSize: 22,
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: soft,
  };

  const urlStyle: CSSProperties = {
    position: "absolute",
    bottom: padY,
    right: padX,
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    color: inkColor,
  };

  const critterOffsetRight = critter?.offset?.right ?? 80;
  const critterOffsetBottom = critter?.offset?.bottom ?? 160;
  const critterSize = critter?.size ?? 440;

  return (
    <div style={containerStyle} data-feed-slide>
      <div style={brandStyle}>{brandLabel}</div>
      {toneLine && <div style={toneStyle}>{toneLine}</div>}

      {middleOverride ? (
        <div
          style={{
            position: "absolute",
            top: 300,
            left: padX,
            right: padX,
            bottom: 260,
          }}
        >
          {middleOverride}
        </div>
      ) : (
        <>
          <div style={bigCopyStyle}>
            {bigCopy.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </div>
          {description && <div style={descriptionStyle}>{description}</div>}
        </>
      )}

      {critter && (
        <div
          style={{
            position: "absolute",
            right: critterOffsetRight,
            bottom: critterOffsetBottom,
            transform: critter.rotate ? `rotate(${critter.rotate}deg)` : undefined,
            pointerEvents: "none",
          }}
        >
          <Critter kind={critter.kind} size={critterSize} />
        </div>
      )}

      {tag && <div style={tagStyle}>{tag}</div>}
      <div style={urlStyle}>{url}</div>
    </div>
  );
}

FeedSlide.WIDTH = WIDTH;
FeedSlide.HEIGHT = HEIGHT;

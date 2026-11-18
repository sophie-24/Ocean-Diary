import { FeedSlide, FeedSlideProps } from "./FeedSlide";

/**
 * Renders N FeedSlides stacked vertically with a small gap so the preview
 * page can show the full carousel at once. Each slide stays at its native
 * 1080×1350; the gap is CSS only and doesn't affect the screenshot frame.
 *
 * Use <FeedSlide/> directly when exporting one PNG at a time; use this for
 * on-screen review of the whole carousel.
 */
export function CarouselDeck({ slides }: { slides: FeedSlideProps[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 40,
        alignItems: "flex-start",
      }}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          data-slide-index={i + 1}
          style={{ boxShadow: "0 24px 60px rgba(14, 42, 92, 0.18)" }}
        >
          <FeedSlide {...slide} />
        </div>
      ))}
    </div>
  );
}

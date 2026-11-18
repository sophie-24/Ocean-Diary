import {
  SPECIES_ART,
  SPECIES_LABEL,
  type CritterKind,
} from "@/data/illustrations";

/**
 * Web equivalent of apps/mobile/src/components/Critter.tsx.
 * Renders the same hand-painted .webp that the native tanks use — the
 * assets are copied into apps/web/public/illustrations/species so there's
 * no runtime fetch to the mobile app.
 *
 * `ghost` variant isn't supported on web yet because the native app achieves
 * the pale silhouette via Image `tintColor`, which has no clean CSS parallel.
 * When the web app needs an uncollected-state visual we'll render the
 * illustration at reduced opacity instead.
 */
export function Critter({
  kind,
  size = 64,
  ghost = false,
  className,
  ariaLabel,
}: {
  kind: CritterKind;
  /** Side length in px (illustrations are roughly square). */
  size?: number;
  ghost?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <img
      src={SPECIES_ART[kind]}
      alt={ariaLabel ?? SPECIES_LABEL[kind]}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        opacity: ghost ? 0.4 : 1,
      }}
      loading="lazy"
      decoding="async"
    />
  );
}

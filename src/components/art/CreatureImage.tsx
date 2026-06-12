import { useState } from "react";

/**
 * CreatureImage — an <img> that fails gracefully.
 *
 * If the painting can't load (e.g. the file isn't in public/images/ yet), it
 * swaps to a soft tinted gradient instead of showing a broken-image icon. This
 * mirrors how HeroArt falls back to the coded ReefScene, so the page is always
 * presentable even before every image is in place.
 *
 * It fills its parent, so the PARENT must set the size and `overflow-hidden`.
 */
export default function CreatureImage({
  src,
  alt,
  focal = "center 45%",
  className = "",
}: {
  src: string;
  alt: string;
  /** object-position for the crop. */
  focal?: string;
  className?: string;
}) {
  const [ok, setOk] = useState(true);

  if (!ok) {
    // Graceful fallback: a calm deep-water gradient so the layout never breaks.
    return (
      <div
        aria-hidden
        className={`h-full w-full bg-gradient-to-br from-surface via-deep to-abyss ${className}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setOk(false)}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
      style={{ objectPosition: focal }}
    />
  );
}

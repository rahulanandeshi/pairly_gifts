"use client";

import * as React from "react";
import { motion } from "motion/react";
import type { TextOverlay } from "@/lib/store/wizard-store";
import { cn } from "@/lib/utils";

interface BookFlipPreviewProps {
  title: string;
  coverImageUrl: string | null;
  contentImageUrl: string | null;
  paletteFrom: string;
  paletteTo: string;
  className?: string;
  /** Text labels dragged onto the cover in the wizard's text-overlay editor — rendered on the front face. */
  overlays?: TextOverlay[];
  /**
   * Controlled mode: when provided, the flip state is driven by the parent
   * (e.g. auto-opening on a timer) instead of the component's own tap
   * handler. Omit both for the default self-contained tap-to-flip behavior.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hides the "tap to open" hint — for contexts where the flip is fully automatic. */
  hideHint?: boolean;
}

/**
 * A 2D page-flip preview — the reliable fallback to the 3D drag-to-rotate
 * mesh. No WebGL/texture-loading dependency, so the card's two real pages
 * (cover + content) are always visible even if 3D fails to render.
 */
export function BookFlipPreview({
  title,
  coverImageUrl,
  contentImageUrl,
  paletteFrom,
  paletteTo,
  className,
  overlays = [],
  open: openProp,
  onOpenChange,
  hideHint = false,
}: BookFlipPreviewProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;

  const toggle = () => {
    if (onOpenChange) onOpenChange(!open);
    if (!controlled) setInternalOpen((o) => !o);
  };

  return (
    <div className={cn("relative", className)} style={{ perspective: "1600px" }}>
      <button
        type="button"
        onClick={toggle}
        className="block h-full w-full cursor-pointer"
        aria-label={open ? "Show the front of the card" : "Open the card to see inside"}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: open ? -180 : 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Front — cover / first page */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl shadow-2xl" style={{ backfaceVisibility: "hidden" }}>
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, not a static/optimizable asset
              <img src={coverImageUrl} alt={title} className="h-full w-full select-none object-cover" draggable={false} />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center p-8 text-center"
                style={{ background: `linear-gradient(135deg, ${paletteFrom}, ${paletteTo})` }}
              >
                <p className="font-display text-2xl text-white text-balance">{title}</p>
              </div>
            )}
            {overlays.map((t) => (
              <p
                key={t.id}
                className="absolute max-w-[85%] -translate-x-1/2 -translate-y-1/2 whitespace-pre-wrap break-words text-center font-display leading-tight"
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  fontSize: `${t.fontSize * 0.65}px`,
                  color: t.color,
                  textShadow: "0 1px 4px rgba(0,0,0,0.35)",
                }}
              >
                {t.text}
              </p>
            ))}
          </div>

          {/* Back — content / second page */}
          <div
            className="absolute inset-0 overflow-hidden rounded-3xl shadow-2xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {contentImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, not a static/optimizable asset
              <img src={contentImageUrl} alt={`Inside ${title}`} className="h-full w-full select-none object-cover" draggable={false} />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center p-8 text-center"
                style={{ background: `linear-gradient(135deg, ${paletteTo}, ${paletteFrom})` }}
              >
                <p className="text-sm text-white/90 text-balance">
                  Inside is a warm, personal message — customize yours to make it truly one of a kind.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </button>

      {!hideHint && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/30 px-3 py-1 text-xs text-white backdrop-blur">
          {open ? "Tap to see the front" : "Tap to open — 2 pages"}
        </p>
      )}
    </div>
  );
}

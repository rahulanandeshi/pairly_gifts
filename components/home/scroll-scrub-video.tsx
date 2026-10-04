"use client";

import * as React from "react";
import { useScroll, useMotionValueEvent } from "motion/react";

interface ScrollScrubVideoProps {
  /** Public path to the folder of frames, e.g. "/hero-frames" (files live in /public/hero-frames). */
  framesPath: string;
  /** Total number of frames exported from the source video. */
  frameCount: number;
  /** Frame file extension, without the dot. */
  extension?: string;
  /** Zero-padded digit count in filenames, e.g. 4 -> frame-0001.webp */
  padding?: number;
  /** How many viewport-heights of scroll to dedicate to the scrub before unpinning. */
  scrollHeightMultiplier?: number;
  /** Rendered above the canvas, inside the pinned area, while scrubbing is active. */
  children?: React.ReactNode;
  /** Rendered instead of the canvas if the frame sequence isn't available yet (e.g. dev placeholder). */
  fallback?: React.ReactNode;
  className?: string;
}

function frameSrc(framesPath: string, index: number, padding: number, extension: string) {
  const n = String(index).padStart(padding, "0");
  return `${framesPath}/frame-${n}.${extension}`;
}

export function ScrollScrubVideo({
  framesPath,
  frameCount,
  extension = "webp",
  padding = 4,
  scrollHeightMultiplier = 3,
  children,
  fallback,
  className,
}: ScrollScrubVideoProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imagesRef = React.useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = React.useRef(0);

  const [status, setStatus] = React.useState<"loading" | "ready" | "unavailable">("loading");
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Respect the user's motion preference — no scroll-jacking, just a still frame.
  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // `wrapperRef` is only attached in the pinned-scrub branch below — the
  // "unavailable" and "reduced motion" branches render different elements
  // entirely. Passing the ref as `target` while it's guaranteed to stay null
  // makes Framer Motion track a ref that will never hydrate, which throws.
  // Fall back to window-scroll tracking (target undefined) in that case.
  const trackingScrub = status !== "unavailable" && !reducedMotion;
  const { scrollYProgress } = useScroll({
    target: trackingScrub ? wrapperRef : undefined,
    offset: ["start start", "end end"],
  });

  const drawFrame = React.useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // object-fit: cover
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const dx = (width - drawW) / 2;
    const dy = (height - drawH) / 2;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, dx, dy, drawW, drawH);
  }, []);

  // Preload every frame; paint as soon as the first one lands, then keep filling in.
  React.useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    imagesRef.current = new Array(frameCount).fill(null);

    const firstImg = new Image();
    firstImg.onerror = () => {
      if (!cancelled) setStatus("unavailable");
    };
    firstImg.onload = () => {
      if (cancelled) return;
      imagesRef.current[0] = firstImg;
      loaded += 1;
      setStatus("ready");
      drawFrame(0);
    };
    firstImg.src = frameSrc(framesPath, 1, padding, extension);

    for (let i = 2; i <= frameCount; i++) {
      const img = new Image();
      const idx = i - 1;
      img.onload = () => {
        if (cancelled) return;
        imagesRef.current[idx] = img;
        loaded += 1;
        if (idx === currentFrameRef.current) drawFrame(idx);
      };
      img.src = frameSrc(framesPath, i, padding, extension);
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framesPath, frameCount, padding, extension]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (status !== "ready" || reducedMotion) return;
    const index = Math.min(frameCount - 1, Math.max(0, Math.round(progress * (frameCount - 1))));
    if (index !== currentFrameRef.current) {
      currentFrameRef.current = index;
      drawFrame(index);
    }
  });

  React.useEffect(() => {
    if (status !== "ready") return;
    const onResize = () => drawFrame(currentFrameRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [status, drawFrame]);

  if (status === "unavailable") {
    return <div className={className}>{fallback}</div>;
  }

  if (reducedMotion) {
    return (
      <div className={className}>
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${frameSrc(framesPath, Math.ceil(frameCount / 2), padding, extension)})` }}
        />
        {children}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={className} style={{ height: `${scrollHeightMultiplier * 100}vh` }}>
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full" />
        {children}
      </div>
    </div>
  );
}

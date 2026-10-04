"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

type ChoreographyImage = string | { src: string; objectPosition?: string };

interface ScrollChoreographyProps {
  className?: string;
  images: {
    topLeft: ChoreographyImage;
    topRight: ChoreographyImage;
    bottomLeft: ChoreographyImage;
    bottomRight: ChoreographyImage;
  };
}

function resolveImage(image: ChoreographyImage) {
  return typeof image === "string" ? { src: image, objectPosition: "center" } : { objectPosition: "center", ...image };
}

// Only worth the scroll-jacking spectacle the first time someone sees it in a
// given session — after that it renders as a plain reveal-on-scroll grid.
const SEEN_KEY = "pairly:seen-scroll-choreography";

export function ScrollChoreography({ className, images }: ScrollChoreographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // On narrow screens the 4-corner scatter needs bigger, closer-together tiles —
  // 36vw of a 375px viewport is ~135px, too small to read a card mockup at.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // null until resolved client-side, to avoid an SSR/client hydration mismatch.
  const [skipAnimation, setSkipAnimation] = useState<boolean | null>(null);
  useEffect(() => {
    const seen = sessionStorage.getItem(SEEN_KEY) === "1";
    setSkipAnimation(seen);
    if (!seen) sessionStorage.setItem(SEEN_KEY, "1");
  }, []);

  // `containerRef` is only ever attached when we render the full choreography
  // below — the "skip" and "loading" branches render different elements
  // entirely. Passing the ref as `target` while it's guaranteed to stay
  // null (skipAnimation !== false) makes Framer Motion track a ref that will
  // never hydrate, which throws. Fall back to window-scroll tracking (target
  // undefined) in that case — its output goes unused anyway since none of
  // the transformed motion.divs render outside the full-choreography branch.
  const { scrollYProgress } = useScroll({
    target: skipAnimation === false ? containerRef : undefined,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120, // Low stiffness so the choreography glides rather than snaps
    damping: 26,
    mass: 1,
    restDelta: 0.001,
  });

  // Default positions relative to center
  const xLeft = isMobile ? "-30vw" : "-20vw";
  const xRight = isMobile ? "30vw" : "20vw";
  const yTop = isMobile ? "-17vh" : "-14vh";
  const yBottom = isMobile ? "17vh" : "14vh";
  const tileSizeClass = isMobile ? "w-[58vw] h-[30vh]" : "w-[36vw] h-[24vh]";
  const heroSize = isMobile ? "58vw" : "36vw";
  const heroSizeH = isMobile ? "30vh" : "24vh";

  // Phase 1: 0 - 0.3 (Diagonal movement)
  // Phase 2: 0.35 - 0.65 (Stack alignment to center)
  // Phase 3: 0.7 - 0.9 (Top Right expands to full screen)

  // Top Left -> moves to Bottom Left, then to Center
  const tlX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xLeft, xLeft, xLeft, "0vw", "0vw"]);
  const tlY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yTop, yBottom, yBottom, "0vh", "0vh"]);

  // Bottom Right -> moves to Top Right, then to Center
  const brX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xRight, xRight, xRight, "0vw", "0vw"]);
  const brY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yBottom, yTop, yTop, "0vh", "0vh"]);

  // Bottom Left -> stays, then moves to Center
  const blX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xLeft, xLeft, xLeft, "0vw", "0vw"]);
  const blY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yBottom, yBottom, yBottom, "0vh", "0vh"]);

  // Top Right -> stays, then moves to Center, then expands
  const trX = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [xRight, xRight, xRight, "0vw", "0vw"]);
  const trY = useTransform(smoothProgress, [0, 0.3, 0.35, 0.65, 1], [yTop, yTop, yTop, "0vh", "0vh"]);

  // Top Right (Hero) scaling/expansion properties
  const heroWidth = useTransform(smoothProgress, [0.65, 0.7, 0.9, 1], [heroSize, heroSize, "100vw", "100vw"]);
  const heroHeight = useTransform(smoothProgress, [0.65, 0.7, 0.9, 1], [heroSizeH, heroSizeH, "100vh", "100vh"]);

  // Opacity fading for images underneath the hero as it expands
  const underImagesOpacity = useTransform(smoothProgress, [0.75, 0.85], [1, 0]);

  const baseImageClasses = cn(
    "absolute left-1/2 top-1/2 overflow-hidden -translate-x-1/2 -translate-y-1/2 bg-muted shadow-2xl will-change-transform",
    tileSizeClass,
  );

  const topLeft = resolveImage(images.topLeft);
  const topRight = resolveImage(images.topRight);
  const bottomLeft = resolveImage(images.bottomLeft);
  const bottomRight = resolveImage(images.bottomRight);

  if (skipAnimation === null) {
    return <div className={cn("min-h-[50vh] w-full", className)} />;
  }

  if (skipAnimation) {
    return (
      <div className={cn("mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 sm:gap-6", className)}>
        {[topLeft, topRight, bottomLeft, bottomRight].map((img, i) => (
          <motion.div
            key={img.src + i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="aspect-[3/2] overflow-hidden rounded-2xl bg-muted shadow-xl"
          >
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="h-full w-full select-none object-cover"
              style={{ objectPosition: img.objectPosition }}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative h-[380vh] w-full", className)}>
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Top Left Image */}
          <motion.div style={{ x: tlX, y: tlY, opacity: underImagesOpacity }} className={cn(baseImageClasses, "z-10")}>
            <img
              src={topLeft.src}
              alt=""
              draggable={false}
              className="h-full w-full select-none object-cover"
              style={{ objectPosition: topLeft.objectPosition }}
            />
          </motion.div>

          {/* Bottom Right Image */}
          <motion.div style={{ x: brX, y: brY, opacity: underImagesOpacity }} className={cn(baseImageClasses, "z-20")}>
            <img
              src={bottomRight.src}
              alt=""
              draggable={false}
              className="h-full w-full select-none object-cover"
              style={{ objectPosition: bottomRight.objectPosition }}
            />
          </motion.div>

          {/* Bottom Left Image */}
          <motion.div style={{ x: blX, y: blY, opacity: underImagesOpacity }} className={cn(baseImageClasses, "z-30")}>
            <img
              src={bottomLeft.src}
              alt=""
              draggable={false}
              className="h-full w-full select-none object-cover"
              style={{ objectPosition: bottomLeft.objectPosition }}
            />
          </motion.div>

          {/* Top Right Image (Hero - expands at the end) */}
          <motion.div
            style={{ x: trX, y: trY, width: heroWidth, height: heroHeight }}
            className={cn(baseImageClasses, "z-40 origin-center bg-black/5")}
          >
            <img
              src={topRight.src}
              alt=""
              draggable={false}
              className="h-full w-full select-none object-cover"
              style={{ objectPosition: topRight.objectPosition }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ScrollChoreography;

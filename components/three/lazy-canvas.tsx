"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LazyCanvasProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Mounts its children (a SceneCanvas) only once scrolled near the viewport.
 * Several R3F <Canvas> instances mounting in the same commit can leave the
 * event system's Provider attached to a torn-down ref — staggering mounts
 * across scroll avoids it, and skips WebGL init for offscreen content.
 */
export function LazyCanvas({ children, className }: LazyCanvasProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={cn("h-full w-full", className)}>
      {visible ? children : null}
    </div>
  );
}

"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpIcon } from "@phosphor-icons/react";

export function ScrollToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          aria-label="Back to top"
          className="glass-panel fixed bottom-6 right-4 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full text-foreground shadow-lg transition-colors hover:text-primary sm:bottom-8 sm:right-8"
        >
          <ArrowUpIcon size={18} weight="bold" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

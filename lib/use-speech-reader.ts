"use client";

import * as React from "react";

/** Reads text aloud via the browser's built-in speech synthesis — used as the
 * default "audio" for a card when no one has recorded a real voice message. */
export function useSpeechReader(text: string) {
  const [speaking, setSpeaking] = React.useState(false);
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const speak = React.useCallback(() => {
    if (!supported || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [text, supported]);

  const stop = React.useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const toggle = React.useCallback(() => (speaking ? stop() : speak()), [speaking, speak, stop]);

  return { speaking, supported, speak, stop, toggle };
}

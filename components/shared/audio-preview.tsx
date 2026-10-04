"use client";

import * as React from "react";
import { PlayIcon, PauseIcon, SpeakerHighIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Waveform } from "@/components/shared/waveform";

interface AudioPreviewProps {
  seed?: string;
  label?: string;
  duration?: number;
}

/** A simulated audio preview — waveform + play control, no real audio file required. */
export function AudioPreview({ seed = "pairly", label = "Voice preview", duration = 8 }: AudioPreviewProps) {
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!playing) return;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p >= 1) {
        setPlaying(false);
        setProgress(0);
        clearInterval(id);
      }
    }, 100);
    return () => clearInterval(id);
  }, [playing, duration]);

  return (
    <div className="glass-panel flex items-center gap-4 rounded-2xl p-4">
      <Button
        size="icon"
        onClick={() => setPlaying((p) => !p)}
        className="size-11 shrink-0 cursor-pointer rounded-full"
        aria-label={playing ? "Pause preview" : "Play preview"}
      >
        {playing ? <PauseIcon size={17} weight="fill" /> : <PlayIcon size={17} weight="fill" />}
      </Button>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <SpeakerHighIcon size={13} /> {label}
        </p>
        <Waveform seed={seed} playing={playing} className="mt-1.5" />
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {Math.round(progress * duration)}s / {duration}s
      </span>
    </div>
  );
}

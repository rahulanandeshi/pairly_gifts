"use client";

import * as React from "react";
import { PlusIcon, TrashIcon, TextAaIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/lib/store/wizard-store";
import { cn } from "@/lib/utils";

const COLOR_SWATCHES = ["#ffffff", "#0b1220", "#e5b567", "#ff8a7a", "#4cc9ff", "#34d399"];

interface TextOverlayEditorProps {
  coverImageUrl: string | null;
  paletteFrom: string;
  paletteTo: string;
}

export function TextOverlayEditor({ coverImageUrl, paletteFrom, paletteTo }: TextOverlayEditorProps) {
  const textOverlays = useWizardStore((s) => s.textOverlays);
  const addTextOverlay = useWizardStore((s) => s.addTextOverlay);
  const updateTextOverlay = useWizardStore((s) => s.updateTextOverlay);
  const removeTextOverlay = useWizardStore((s) => s.removeTextOverlay);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const boardRef = React.useRef<HTMLDivElement>(null);
  const draggingId = React.useRef<string | null>(null);

  const selected = textOverlays.find((t) => t.id === selectedId) ?? null;

  const handleAdd = () => {
    const id = addTextOverlay({ text: "Your text here", x: 50, y: 50, fontSize: 24, color: "#ffffff" });
    setSelectedId(id);
  };

  const clampPercent = (v: number) => Math.min(96, Math.max(4, v));

  const handlePointerDown = (id: string) => (e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedId(id);
    draggingId.current = id;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId.current || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = clampPercent(((e.clientX - rect.left) / rect.width) * 100);
    const y = clampPercent(((e.clientY - rect.top) / rect.height) * 100);
    updateTextOverlay(draggingId.current, { x, y });
  };

  const handlePointerUp = () => {
    draggingId.current = null;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Add text directly on the card</p>
        <Button type="button" size="sm" variant="outline" onClick={handleAdd} className="cursor-pointer gap-1.5 rounded-full text-xs">
          <PlusIcon size={13} weight="bold" /> Add Text
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Optional — drag any text label anywhere on the card. Tap a label to edit or remove it.</p>

      <div
        ref={boardRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => setSelectedId(null)}
        className="relative aspect-[4/5] w-full max-w-xs select-none overflow-hidden rounded-2xl shadow-lg"
        style={coverImageUrl ? undefined : { background: `linear-gradient(135deg, ${paletteFrom}, ${paletteTo})` }}
      >
        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, not a static/optimizable asset
          <img src={coverImageUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" draggable={false} />
        )}
        {textOverlays.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
            <TextAaIcon size={22} />
            <p className="text-xs">No text added yet</p>
          </div>
        )}
        {textOverlays.map((t) => (
          <div
            key={t.id}
            onPointerDown={handlePointerDown(t.id)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(t.id);
            }}
            className={cn(
              "absolute max-w-[85%] -translate-x-1/2 -translate-y-1/2 cursor-move whitespace-pre-wrap break-words rounded-md px-1.5 py-0.5 text-center font-display leading-tight transition-shadow",
              t.id === selectedId ? "ring-2 ring-primary/80" : "hover:ring-1 hover:ring-white/60",
            )}
            style={{ left: `${t.x}%`, top: `${t.y}%`, fontSize: `${t.fontSize}px`, color: t.color, textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}
          >
            {t.text || "Text"}
          </div>
        ))}
      </div>

      {selected && (
        <div className="glass-panel flex flex-col gap-3 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2">
            <input
              value={selected.text}
              onChange={(e) => updateTextOverlay(selected.id, { text: e.target.value })}
              placeholder="Type your text…"
              className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => {
                removeTextOverlay(selected.id);
                setSelectedId(null);
              }}
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
              aria-label="Remove text"
            >
              <TrashIcon size={15} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Size
              <input
                type="range"
                min={12}
                max={48}
                value={selected.fontSize}
                onChange={(e) => updateTextOverlay(selected.id, { fontSize: Number(e.target.value) })}
                className="cursor-pointer"
              />
            </label>
            <div className="flex items-center gap-1.5">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateTextOverlay(selected.id, { color: c })}
                  className={cn("size-5 cursor-pointer rounded-full ring-offset-2 ring-offset-background", selected.color === c && "ring-2 ring-primary")}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small color helpers for the theme system — pure, no dependencies, safe to
// import from both server and client code. Every theme token is stored as a
// plain CSS color string (#rgb, #rrggbb, #rrggbbaa, rgb(), rgba()) so the
// admin editor can show a native color picker for it and derived tokens can
// be computed without a runtime CSS engine.

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function parseColor(input: string): Rgba | null {
  const s = input.trim().toLowerCase();

  const hex = s.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
  if (rgb) {
    const alpha = rgb[4] ? (rgb[4].endsWith("%") ? parseFloat(rgb[4]) / 100 : parseFloat(rgb[4])) : 1;
    return { r: clamp(+rgb[1], 0, 255), g: clamp(+rgb[2], 0, 255), b: clamp(+rgb[3], 0, 255), a: clamp(alpha, 0, 1) };
  }
  return null;
}

const hex2 = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");

/** Opaque #rrggbb — what `<input type="color">` requires. Alpha is dropped. */
export function toHex6(c: string | Rgba): string {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return "#000000";
  return `#${hex2(p.r)}${hex2(p.g)}${hex2(p.b)}`;
}

/** Canonical CSS output: #rrggbb when opaque, rgba() otherwise. */
export function toCss(c: string | Rgba): string {
  const p = typeof c === "string" ? parseColor(c) : c;
  if (!p) return typeof c === "string" ? c : "#000000";
  if (p.a >= 0.999) return toHex6(p);
  return `rgba(${Math.round(p.r)}, ${Math.round(p.g)}, ${Math.round(p.b)}, ${+p.a.toFixed(3)})`;
}

export function withAlpha(c: string, alpha: number): string {
  const p = parseColor(c);
  if (!p) return c;
  return toCss({ ...p, a: clamp(alpha, 0, 1) });
}

/** Keeps the alpha of `previous` when the user picks a new opaque color for a translucent token. */
export function pickKeepingAlpha(previous: string, pickedHex: string): string {
  const prev = parseColor(previous);
  const next = parseColor(pickedHex);
  if (!next) return pickedHex;
  return toCss({ ...next, a: prev ? prev.a : 1 });
}

/** Linear blend of `a` toward `b` (t = 0 → a, t = 1 → b), ignoring alpha (result is opaque). */
export function mix(a: string, b: string, t: number): string {
  const pa = parseColor(a);
  const pb = parseColor(b);
  if (!pa || !pb) return a;
  return toCss({
    r: pa.r + (pb.r - pa.r) * t,
    g: pa.g + (pb.g - pa.g) * t,
    b: pa.b + (pb.b - pa.b) * t,
    a: 1,
  });
}

function channel(v: number) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(c: string): number {
  const p = parseColor(c);
  if (!p) return 0;
  return 0.2126 * channel(p.r) + 0.7152 * channel(p.g) + 0.0722 * channel(p.b);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Near-white or near-black — whichever reads better on `bg`. */
export function readableOn(bg: string, light = "#fefdfb", dark = "#0b1220"): string {
  return contrastRatio(bg, light) >= contrastRatio(bg, dark) ? light : dark;
}

export function isValidColor(input: string): boolean {
  return parseColor(input) !== null;
}

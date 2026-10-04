// Shared with both the client-side style picker (avatar-step.tsx) and the
// server-only prompt builder (image-gen.ts) — kept in its own file since
// image-gen.ts imports "server-only" and can't be pulled into a client bundle.
export const ILLUSTRATION_STYLES = [
  { id: "pixar", label: "Pixar-Style 3D", promptFragment: "Pixar/DreamWorks 3D animated movie style, warm lighting, expressive characters" },
  { id: "anime", label: "Anime", promptFragment: "Studio Ghibli-inspired anime illustration style, soft cel-shading" },
  { id: "watercolor", label: "Watercolor", promptFragment: "soft watercolor painting style, gentle washes of color" },
  { id: "storybook", label: "Storybook", promptFragment: "classic children's storybook illustration style, warm and whimsical" },
  { id: "comic", label: "Comic Book", promptFragment: "modern comic book illustration style, bold linework and flat colors" },
  { id: "papercraft", label: "Papercraft", promptFragment: "layered papercraft / cutout collage illustration style" },
] as const;

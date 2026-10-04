"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// A "persona" is either a Ready Player Me avatar (built in the embedded
// creator, optionally from a selfie) or an AI-generated stylized family
// illustration — both reduce to "one image URL to show", so every render
// call site only ever needs `imageUrl`, regardless of which path produced it.
export interface AvatarConfig {
  kind: "avatar" | "illustration";
  imageUrl: string;
  glbUrl?: string; // Ready Player Me 3D model URL — avatar path only
  style?: string; // illustration style id — illustration path only
  animation?: string; // optional cosmetic CSS animation (wave/dance/bow/bob), works on either kind
}

// A single piece of text a user has dragged onto the card's cover image.
// x/y are percentages (0-100) of the card's width/height, so position holds
// up across any render size (wizard editor, preview, recipient view).
export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface WizardState {
  occasion: string | null;
  culture: string | null;
  cardId: string | null;
  avatar: AvatarConfig;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  deliveryChannel: "email" | "sms" | "link";
  tone: string;
  message: string;
  textOverlays: TextOverlay[];
  audioRecorded: boolean;
  audioDuration: number;
  audioUrl: string | null;
  photos: string[];
  videoAttached: boolean;
  giftBrand: string | null;
  giftAmount: number | null;
  deliveryMode: "now" | "schedule";
  scheduleDate: string | null;
  scheduleAt: string | null; // ISO timestamp — scheduleDate is the display string, this is what gets persisted
  plan: "one-time" | "subscription";

  setField: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  setAvatar: (partial: Partial<AvatarConfig>) => void;
  addTextOverlay: (overlay: Omit<TextOverlay, "id">) => string;
  updateTextOverlay: (id: string, partial: Partial<Omit<TextOverlay, "id">>) => void;
  removeTextOverlay: (id: string) => void;
  reset: () => void;
}

const defaultAvatar: AvatarConfig = {
  kind: "avatar",
  imageUrl: "/avatars/default.svg",
  animation: "wave",
};

const initialState = {
  occasion: null,
  culture: null,
  cardId: null,
  avatar: defaultAvatar,
  recipientName: "",
  recipientEmail: "",
  recipientPhone: "",
  deliveryChannel: "email" as const,
  tone: "heartfelt",
  message: "",
  textOverlays: [],
  audioRecorded: false,
  audioDuration: 0,
  audioUrl: null,
  photos: [],
  videoAttached: false,
  giftBrand: null,
  giftAmount: null,
  deliveryMode: "now" as const,
  scheduleDate: null,
  scheduleAt: null,
  plan: "one-time" as const,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      ...initialState,
      setField: (key, value) => set({ [key]: value } as Partial<WizardState>),
      setAvatar: (partial) => set((s) => ({ avatar: { ...s.avatar, ...partial } })),
      addTextOverlay: (overlay) => {
        const id = `text-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        set((s) => ({ textOverlays: [...s.textOverlays, { ...overlay, id }] }));
        return id;
      },
      updateTextOverlay: (id, partial) =>
        set((s) => ({ textOverlays: s.textOverlays.map((t) => (t.id === id ? { ...t, ...partial } : t)) })),
      removeTextOverlay: (id) => set((s) => ({ textOverlays: s.textOverlays.filter((t) => t.id !== id) })),
      reset: () => set(initialState),
    }),
    {
      name: "pairly-wizard",
      // v1: AvatarConfig was rebuilt around @dicebear/avataaars option ids —
      // the old field set (skinTone/hair/outfit/accessory) has no sensible
      // mapping, so a persisted v0 avatar is just reset to the new default
      // rather than left with undefined fields that render an empty avatar.
      // v2: AvatarConfig was rebuilt again around Ready Player Me (avatar) /
      // AI illustration (image) instead of DiceBear option ids — again no
      // sensible field mapping, so a persisted v<2 avatar resets to default.
      // v3: the default avatar's imageUrl briefly pointed at a nonexistent
      // /avatars/default.png before being corrected to default.svg — anyone
      // who loaded the app in that window has the dead .png path baked into
      // their persisted v2 state, so force one more reset to pick up the fix.
      version: 3,
      migrate: (persistedState, version) => {
        const state = persistedState as WizardState;
        if (version < 1) state.avatar = defaultAvatar;
        if (version < 2) state.avatar = defaultAvatar;
        if (version < 3) state.avatar = defaultAvatar;
        return state;
      },
    },
  ),
);

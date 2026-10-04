"use client";

import * as React from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import {
  MicrophoneIcon,
  StopIcon,
  UploadSimpleIcon,
  LockSimpleIcon,
  PlayIcon,
  PauseIcon,
  SpeakerHighIcon,
  ArrowsClockwiseIcon,
  ImageIcon,
  XIcon,
  VideoCameraIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { StepShell } from "@/components/wizard/step-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Waveform } from "@/components/shared/waveform";
import { useWizardStore } from "@/lib/store/wizard-store";
import { uploadWizardMedia, refreshPlaybackUrl } from "@/app/create/upload-actions";
import { useSpeechReader } from "@/lib/use-speech-reader";
import type { GreetingCard } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Tab = "voice" | "photos" | "video";
const TABS: { id: Tab; label: string }[] = [
  { id: "voice", label: "Voice" },
  { id: "photos", label: "Photos" },
  { id: "video", label: "Video" },
];

export function ExtrasStep({ cards }: { cards: GreetingCard[] }) {
  const [tab, setTab] = React.useState<Tab>("voice");

  return (
    <StepShell slug="extras" title="Add the extras" description="All optional — skip anything that doesn't fit." nextLabel="Continue" cards={cards}>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all",
              tab === t.id ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "voice" && <VoiceTab cards={cards} />}
        {tab === "photos" && <PhotosTab />}
        {tab === "video" && <VideoTab />}
      </div>
    </StepShell>
  );
}

function VoiceTab({ cards }: { cards: GreetingCard[] }) {
  const { cardId, audioRecorded, audioDuration, audioUrl, setField } = useWizardStore(
    useShallow((s) => ({
      cardId: s.cardId,
      audioRecorded: s.audioRecorded,
      audioDuration: s.audioDuration,
      audioUrl: s.audioUrl,
      setField: s.setField,
    })),
  );
  const selectedCard = cards.find((c) => c.id === cardId);
  const reader = useSpeechReader(selectedCard?.description ?? "");

  const [mode, setMode] = React.useState<"default" | "record">(audioUrl ? "record" : "default");
  const [recording, setRecording] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [enhance, setEnhance] = React.useState(true);
  const [bgMusic, setBgMusic] = React.useState(false);
  const [noiseReduction, setNoiseReduction] = React.useState(true);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const elapsedRef = React.useRef(0);

  React.useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setElapsed((e) => (elapsedRef.current = e + 1)), 1000);
    return () => clearInterval(id);
  }, [recording]);

  React.useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  React.useEffect(() => {
    if (!audioUrl || previewUrl) return;
    refreshPlaybackUrl(audioUrl).then((result) => {
      if ("success" in result) setPreviewUrl(result.url ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  const uploadBlob = async (blob: Blob, filename: string, duration: number | null) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("kind", "audio");
    const result = await uploadWizardMedia(formData);
    setUploading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    setField("audioUrl", result.key);
    setField("audioRecorded", true);
    if (duration != null) setField("audioDuration", duration);
    setPreviewUrl(result.previewUrl);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Your browser doesn't support microphone recording — try uploading an audio file instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      elapsedRef.current = 0;
      setElapsed(0);
      setFileName(null);

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        uploadBlob(blob, "recording.webm", elapsedRef.current);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      toast.error("Microphone access was denied — check your browser permissions and try again.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const probe = document.createElement("audio");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      const duration = Number.isFinite(probe.duration) ? Math.round(probe.duration) : null;
      URL.revokeObjectURL(probe.src);
      uploadBlob(file, file.name, duration);
    };
    probe.src = URL.createObjectURL(file);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  };

  const switchToDefault = () => {
    if (recording) stopRecording();
    reader.stop();
    setField("audioUrl", null);
    setField("audioRecorded", false);
    setPreviewUrl(null);
    setFileName(null);
    setMode("default");
  };

  const busy = recording || uploading;

  return mode === "default" ? (
    <GlassPanel className="p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <button
          type="button"
          onClick={reader.toggle}
          disabled={!reader.supported}
          className={cn(
            "flex size-24 cursor-pointer items-center justify-center rounded-full text-white shadow-xl transition-all disabled:cursor-not-allowed disabled:opacity-60",
            reader.speaking ? "bg-destructive scale-110 animate-pulse" : "bg-primary hover:scale-105",
          )}
          aria-label={reader.speaking ? "Stop narration" : "Play narration"}
        >
          {reader.speaking ? <StopIcon size={30} weight="fill" /> : <SpeakerHighIcon size={30} weight="fill" />}
        </button>
        <div>
          <p className="text-sm font-medium">Default narration</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {reader.supported
              ? "We'll read the card's description aloud to your recipient."
              : "Your browser doesn't support spoken narration — the card will open silently unless you record your own audio."}
          </p>
          {selectedCard && <p className="mx-auto mt-3 max-w-sm text-xs italic text-muted-foreground">&ldquo;{selectedCard.description}&rdquo;</p>}
        </div>

        <Button type="button" variant="outline" onClick={() => setMode("record")} className="h-11 cursor-pointer gap-2 rounded-full px-6">
          <MicrophoneIcon size={16} /> Record Your Own Voice Instead
        </Button>
      </div>
    </GlassPanel>
  ) : (
    <GlassPanel className="p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={uploading}
          className={cn(
            "flex size-24 cursor-pointer items-center justify-center rounded-full text-white shadow-xl transition-all disabled:cursor-not-allowed disabled:opacity-60",
            recording ? "bg-destructive scale-110 animate-pulse" : "bg-primary hover:scale-105",
          )}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {recording ? <StopIcon size={30} weight="fill" /> : <MicrophoneIcon size={30} weight="fill" />}
        </button>
        <p className="text-sm text-muted-foreground">
          {recording ? `Recording… ${elapsed}s` : uploading ? "Uploading…" : audioRecorded ? "Recording captured" : "Tap to start recording"}
        </p>

        {(busy || audioRecorded) && (
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-3">
              {audioRecorded && !busy && previewUrl && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={togglePlayback}
                  className="size-10 shrink-0 cursor-pointer rounded-full"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <PauseIcon size={15} weight="fill" /> : <PlayIcon size={15} weight="fill" />}
                </Button>
              )}
              <Waveform seed={fileName ?? "recording"} playing={recording || playing} className="flex-1" />
            </div>
            {previewUrl && (
              <audio
                ref={audioRef}
                src={previewUrl}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                className="hidden"
              />
            )}
            {fileName && <p className="mt-2 text-center text-xs text-muted-foreground">{fileName}</p>}
            {audioRecorded && !fileName && !busy && <p className="mt-2 text-center text-xs text-muted-foreground">{audioDuration}s recording</p>}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-px w-8 bg-border" /> or <span className="h-px w-8 bg-border" />
        </div>

        <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleUpload} className="hidden" />
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="h-11 cursor-pointer gap-2 rounded-full px-6"
        >
          <UploadSimpleIcon size={16} /> Upload Audio File
        </Button>

        <button
          type="button"
          onClick={switchToDefault}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowsClockwiseIcon size={12} /> Use default narration instead
        </button>
      </div>

      <div className="mt-10 flex flex-col gap-4 border-t border-border/60 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">AI Voice Enhancement</p>
            <p className="text-xs text-muted-foreground">Clean and warm up your voice automatically.</p>
          </div>
          <Switch checked={enhance} onCheckedChange={setEnhance} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Background Music</p>
            <p className="text-xs text-muted-foreground">Add a subtle instrumental behind your voice.</p>
          </div>
          <Switch checked={bgMusic} onCheckedChange={setBgMusic} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Noise Reduction</p>
            <p className="text-xs text-muted-foreground">Reduce background noise for clarity.</p>
          </div>
          <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} />
        </div>
        <div className="flex items-center justify-between opacity-60">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <LockSimpleIcon size={13} /> Voice Cloning
            </p>
            <p className="text-xs text-muted-foreground">Premium — clone your voice for future cards.</p>
          </div>
          <Switch disabled />
        </div>
      </div>
    </GlassPanel>
  );
}

function PhotosTab() {
  const photos = useWizardStore((s) => s.photos);
  const setField = useWizardStore((s) => s.setField);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setField("photos", [...photos, ...urls].slice(0, 8));
  };

  const removePhoto = (url: string) => {
    setField(
      "photos",
      photos.filter((p) => p !== url),
    );
  };

  return (
    <GlassPanel className="p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((url) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element -- client-side blob URL, not an optimizable static asset */}
            <img src={url} alt="Uploaded photo" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(url)}
              className="absolute right-1.5 top-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove photo"
            >
              <XIcon size={12} />
            </button>
          </div>
        ))}
        {photos.length < 8 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <ImageIcon size={22} />
            <span className="text-xs font-medium">Add Photo</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      {photos.length === 0 && (
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="mt-6 h-11 cursor-pointer gap-2 rounded-full">
          <UploadSimpleIcon size={16} /> Upload Photos
        </Button>
      )}
    </GlassPanel>
  );
}

function VideoTab() {
  const videoAttached = useWizardStore((s) => s.videoAttached);
  const setField = useWizardStore((s) => s.setField);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUrl(URL.createObjectURL(file));
    setField("videoAttached", true);
  };

  const removeVideo = () => {
    setVideoUrl(null);
    setField("videoAttached", false);
  };

  return (
    <GlassPanel className="p-6">
      {videoUrl ? (
        <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl">
          <video src={videoUrl} controls className="w-full rounded-2xl" />
          <button
            type="button"
            onClick={removeVideo}
            className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white"
            aria-label="Remove video"
          >
            <XIcon size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mx-auto flex aspect-video w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <VideoCameraIcon size={28} />
          <span className="text-sm font-medium">Upload a video</span>
          <span className="text-xs">MP4, up to 60 seconds</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
      {!videoUrl && (
        <div className="mt-6 flex justify-center">
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="h-11 cursor-pointer gap-2 rounded-full">
            <UploadSimpleIcon size={16} /> Choose Video
          </Button>
        </div>
      )}
      {videoAttached && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-success">
          <CheckCircleIcon size={13} weight="fill" /> Video attached
        </p>
      )}
    </GlassPanel>
  );
}

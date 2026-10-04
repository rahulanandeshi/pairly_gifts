"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WarningIcon, PaintBrushIcon } from "@phosphor-icons/react";
import type { UserModel, CultureModel } from "@/lib/generated/prisma/models";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { updateProfile, becomeCreator, deleteAccount } from "@/app/dashboard/actions";
import { useFeatures } from "@/components/features-provider";

const NOTIF_PREFS: { id: string; label: string; description: string; feature?: "giftCards" }[] = [
  { id: "delivery", label: "Card delivery updates", description: "When your cards are opened or delivered." },
  { id: "gift", label: "Gift card activity", description: "Redemptions and gift card status changes.", feature: "giftCards" },
  { id: "billing", label: "Billing receipts", description: "Payment confirmations and renewal reminders." },
  { id: "marketing", label: "Product news", description: "New templates, features, and seasonal collections." },
];

interface SettingsClientProps {
  user: UserModel;
  cultures: CultureModel[];
}

export function SettingsClient({ user, cultures }: SettingsClientProps) {
  const router = useRouter();
  const features = useFeatures();
  const [name, setName] = React.useState(user.name ?? "");
  const [bio, setBio] = React.useState(user.bio ?? "");
  const [cultureSlug, setCultureSlug] = React.useState(user.cultureSlug ?? "");
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [becomingCreator, setBecomingCreator] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);

  const cultureMap = React.useMemo(() => Object.fromEntries(cultures.map((c) => [c.slug, c.name])), [cultures]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const result = await updateProfile({ name, bio, cultureSlug });
    setSavingProfile(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile updated.");
    router.refresh();
  };

  const handleBecomeCreator = async () => {
    setBecomingCreator(true);
    const result = await becomeCreator();
    setBecomingCreator(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("You're now a Pairly Creator!");
    router.push("/creator");
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteAccount();
    if (result?.error) {
      setDeleting(false);
      setDeleteOpen(false);
      toast.error(result.error);
    }
    // On success, deleteAccount() redirects server-side.
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <GlassPanel className="p-6">
          <h2 className="font-medium">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="settings-name">Full name</Label>
              <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" type="email" defaultValue={user.email ?? ""} disabled className="h-10" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="settings-culture">Culture</Label>
              <Select value={cultureSlug} onValueChange={(v) => setCultureSlug(v as string)}>
                <SelectTrigger id="settings-culture" className="h-10 w-full rounded-lg">
                  <SelectValue placeholder="Select a culture (optional)">{(v: string) => cultureMap[v] ?? "Select a culture (optional)"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {cultures.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="settings-bio">Bio</Label>
              <Textarea id="settings-bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} rows={3} />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile} className="mt-4 cursor-pointer rounded-full">
            {savingProfile ? "Saving…" : "Save Changes"}
          </Button>
        </GlassPanel>

        {user.role === "USER" && (
          <GlassPanel className="p-6">
            <h2 className="flex items-center gap-1.5 font-medium">
              <PaintBrushIcon size={16} weight="duotone" /> Creator Program
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Design and sell your own greeting cards on Pairly — set your own prices and get paid out monthly.
            </p>
            <Button
              variant="outline"
              onClick={handleBecomeCreator}
              disabled={becomingCreator}
              className="mt-4 cursor-pointer rounded-full"
            >
              {becomingCreator ? "Setting up…" : "Start Selling Cards"}
            </Button>
          </GlassPanel>
        )}

        <GlassPanel className="p-6">
          <h2 className="font-medium">Notifications</h2>
          <div className="mt-4 flex flex-col gap-4">
            {NOTIF_PREFS.filter((p) => !p.feature || features[p.feature]).map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
                <Switch defaultChecked={p.id !== "marketing"} />
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="font-medium">Accessibility</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reduce motion</p>
                <p className="text-xs text-muted-foreground">Minimize animations across the app.</p>
              </div>
              <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">High contrast</p>
                <p className="text-xs text-muted-foreground">Increase text and UI contrast.</p>
              </div>
              <Switch checked={highContrast} onCheckedChange={setHighContrast} />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="border-destructive/30 p-6">
          <h2 className="flex items-center gap-1.5 font-medium text-destructive">
            <WarningIcon size={16} weight="duotone" /> Danger Zone
          </h2>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)} className="cursor-pointer rounded-full">
              Delete Account
            </Button>
          </div>
        </GlassPanel>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently deletes your Pairly account. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="cursor-pointer rounded-full" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="cursor-pointer rounded-full">
              {deleting ? "Deleting…" : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

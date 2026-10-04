"use client";

import * as React from "react";
import { PaletteIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AppearancePanel } from "@/components/appearance/appearance-panel";
import { useAppearance } from "@/components/appearance-provider";

/** Palette button that opens the personal-theme drawer. Renders nothing when the admin has turned personal themes off. */
export function AppearanceButton() {
  const { theme } = useAppearance();
  const [open, setOpen] = React.useState(false);
  if (!theme.allowUserTheme) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="cursor-pointer rounded-full" aria-label="Customize appearance" />}
            />
          }
        >
          <PaletteIcon size={19} weight="duotone" />
        </TooltipTrigger>
        <TooltipContent>Customize</TooltipContent>
      </Tooltip>
      <SheetContent side="right" className="w-[360px] overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Make it yours</SheetTitle>
          <SheetDescription>Changes preview instantly. Your look is saved on this device.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-8">{open && <AppearancePanel onDone={() => setOpen(false)} />}</div>
      </SheetContent>
    </Sheet>
  );
}

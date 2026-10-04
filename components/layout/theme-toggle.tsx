"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonStarsIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="cursor-pointer rounded-full"
          />
        }
      >
        {mounted ? (
          isDark ? <SunIcon size={19} weight="duotone" /> : <MoonStarsIcon size={19} weight="duotone" />
        ) : (
          <span className="size-[19px]" />
        )}
      </TooltipTrigger>
      <TooltipContent>{isDark ? "Light mode" : "Dark mode"}</TooltipContent>
    </Tooltip>
  );
}

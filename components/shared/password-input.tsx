"use client";

import * as React from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-10" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1/2 size-7 -translate-y-1/2 cursor-pointer rounded-full"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeSlashIcon size={15} /> : <EyeIcon size={15} />}
      </Button>
    </div>
  );
}

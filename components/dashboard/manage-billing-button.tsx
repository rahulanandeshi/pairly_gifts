"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createBillingPortalSession } from "@/app/dashboard/actions";

export function ManageBillingButton({ label = "Manage Billing", ...props }: { label?: string } & React.ComponentProps<typeof Button>) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    const result = await createBillingPortalSession();
    if (result.error || !result.url) {
      setLoading(false);
      toast.error(result.error ?? "Something went wrong.");
      return;
    }
    window.location.href = result.url;
  };

  return (
    <Button onClick={handleClick} disabled={loading} className="cursor-pointer rounded-full" {...props}>
      {loading ? "Redirecting…" : label}
    </Button>
  );
}

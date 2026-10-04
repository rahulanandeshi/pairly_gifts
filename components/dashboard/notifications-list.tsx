"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TruckIcon, GiftIcon, CreditCardIcon, SparkleIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { markNotificationRead, markAllNotificationsRead } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";

const ICONS = { DELIVERY: TruckIcon, GIFT: GiftIcon, BILLING: CreditCardIcon, SYSTEM: SparkleIcon } as const;

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: keyof typeof ICONS;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

export function NotificationsList({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const hasUnread = notifications.some((n) => !n.read);

  const handleClick = async (n: NotificationRow) => {
    if (!n.read) await markNotificationRead(n.id);
    if (n.link) router.push(n.link);
    else router.refresh();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {hasUnread && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleMarkAll} className="cursor-pointer rounded-full text-xs">
            Mark all as read
          </Button>
        </div>
      )}
      <GlassPanel className="overflow-hidden p-0">
        <div className="flex flex-col divide-y divide-border/60">
          {notifications.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => handleClick(n)}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left sm:p-5",
                  (n.link || !n.read) && "cursor-pointer",
                  !n.read && "bg-primary/[0.03]",
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={16} weight="duotone" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.createdAt.toLocaleString()}</p>
                </div>
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}

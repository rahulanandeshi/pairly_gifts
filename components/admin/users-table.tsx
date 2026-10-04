"use client";

import * as React from "react";
import { toast } from "sonner";
import { ProhibitIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { setUserBanned } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<string, string> = {
  USER: "bg-muted text-muted-foreground",
  CREATOR: "bg-primary/10 text-primary",
  BUSINESS: "bg-gold/15 text-gold",
  ADMIN: "bg-electric/15 text-electric",
};

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  banned: boolean;
  joined: string;
}

export function UsersTable({ users }: { users: AdminUserRow[] }) {
  const [rows, setRows] = React.useState(users);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const handleToggle = async (id: string, banned: boolean) => {
    setPendingId(id);
    const result = await setUserBanned(id, banned);
    setPendingId(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setRows((prev) => prev.map((u) => (u.id === id ? { ...u, banned } : u)));
    toast.success(banned ? "User suspended." : "User reactivated.");
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30 text-left text-xs text-muted-foreground">
            <th className="p-4 font-medium">Name</th>
            <th className="p-4 font-medium">Plan</th>
            <th className="p-4 font-medium">Role</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Joined</th>
            <th className="p-4 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-border/40 last:border-0">
              <td className="p-4">
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </td>
              <td className="p-4 text-muted-foreground">{u.plan}</td>
              <td className="p-4">
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium capitalize", ROLE_STYLES[u.role])}>{u.role.toLowerCase()}</span>
              </td>
              <td className="p-4">
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", u.banned ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success")}>
                  {u.banned ? "Suspended" : "Active"}
                </span>
              </td>
              <td className="p-4 text-muted-foreground">{u.joined}</td>
              <td className="p-4">
                {u.role !== "ADMIN" && (
                  <button
                    type="button"
                    disabled={pendingId === u.id}
                    onClick={() => handleToggle(u.id, !u.banned)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                      u.banned ? "text-success hover:bg-success/10" : "text-destructive hover:bg-destructive/10",
                    )}
                  >
                    {u.banned ? <CheckCircleIcon size={13} weight="bold" /> : <ProhibitIcon size={13} weight="bold" />}
                    {u.banned ? "Reactivate" : "Suspend"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

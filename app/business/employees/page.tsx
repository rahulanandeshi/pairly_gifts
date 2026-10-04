import type { Metadata } from "next";
import { CakeIcon, TrophyIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { BUSINESS_NAV } from "@/lib/dashboard-nav";
import { employees } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Employee Directory" };

export default function EmployeeDirectoryPage() {
  return (
    <DashboardPageShell
      title="Employee Directory"
      description={`${employees.length} employees · birthdays & anniversaries tracked automatically`}
      nav={BUSINESS_NAV}
      brand="Pairly Business"
      action={<Button className="cursor-pointer gap-1.5 rounded-full"><PlusIcon size={14} weight="bold" /> Add Employee</Button>}
    >
      <GlassPanel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium"><span className="inline-flex items-center gap-1"><CakeIcon size={12} /> Birthday</span></th>
                <th className="p-4 font-medium"><span className="inline-flex items-center gap-1"><TrophyIcon size={12} /> Anniversary</span></th>
                <th className="p-4 font-medium">Tenure</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-b border-border/40 last:border-0">
                  <td className="p-4">
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.role}</p>
                  </td>
                  <td className="p-4 text-muted-foreground">{e.department}</td>
                  <td className="p-4 text-muted-foreground">{e.birthday}</td>
                  <td className="p-4 text-muted-foreground">{e.anniversary}</td>
                  <td className="p-4 text-muted-foreground">{e.yearsAtCompany} yr{e.yearsAtCompany !== 1 ? "s" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </DashboardPageShell>
  );
}

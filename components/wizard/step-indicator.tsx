"use client";

import * as React from "react";
import Link from "next/link";
import { CheckIcon } from "@phosphor-icons/react";
import { getWizardSteps } from "@/lib/wizard-steps";
import { useFeatures } from "@/components/features-provider";
import { cn } from "@/lib/utils";

export function StepIndicator({ current }: { current: number }) {
  const WIZARD_STEPS = getWizardSteps(useFeatures());

  return (
    <div>
      {/* Mobile: compact bar */}
      <div className="sm:hidden">
        <p className="text-xs font-medium text-muted-foreground">
          Step {current + 1} of {WIZARD_STEPS.length} — {WIZARD_STEPS[current].label}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((current + 1) / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: full step rail */}
      <div className="hidden items-center sm:flex">
        {WIZARD_STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = i <= current;
          const circle = (
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                done && "bg-primary text-primary-foreground",
                active && "bg-primary/15 text-primary ring-2 ring-primary",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <CheckIcon size={12} weight="bold" /> : i + 1}
            </span>
          );
          return (
            <React.Fragment key={step.slug}>
              {clickable ? (
                <Link href={`/create/${step.slug}`} className="group flex flex-col items-center gap-1.5" title={step.label}>
                  {circle}
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-1.5 opacity-40" title={step.label}>
                  {circle}
                </div>
              )}
              {i < WIZARD_STEPS.length - 1 && (
                <span className={cn("mx-1 h-px flex-1", done ? "bg-primary" : "bg-border")} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-2 hidden text-xs font-medium text-muted-foreground sm:block">
        Step {current + 1} of {WIZARD_STEPS.length} — {WIZARD_STEPS[current].label}
      </p>
    </div>
  );
}

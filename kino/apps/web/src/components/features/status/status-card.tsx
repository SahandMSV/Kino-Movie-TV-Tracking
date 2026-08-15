"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { refreshCheckAction } from "@/lib/actions/status";
import type { CheckId, CheckStatus, HealthCheck } from "@/lib/status/checks";
import { cn } from "@/lib/utils";

function statusConfig(status: CheckStatus) {
  switch (status) {
    case "operational":
      return {
        dot: "bg-emerald-500",
        badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        label: "Operational",
      };
    case "degraded":
      return {
        dot: "bg-amber-500",
        badge: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        label: "Degraded",
      };
    case "down":
      return {
        dot: "bg-red-500",
        badge: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
        label: "Down",
      };
  }
}

type StatusCardProps = {
  initial: HealthCheck;
};

export function StatusCard({ initial }: StatusCardProps) {
  const [check, setCheck] = useState<HealthCheck>(initial);
  const [isPending, startTransition] = useTransition();
  const config = statusConfig(check.status);

  const refresh = () => {
    startTransition(async () => {
      try {
        const updated = await refreshCheckAction(check.id as CheckId);
        setCheck(updated);
      } catch {
        toast.error(`Failed to refresh ${check.name}`);
      }
    });
  };

  return (
    <Card className='group relative overflow-hidden transition-shadow hover:shadow-md py-3'>
      <CardHeader className='flex flex-row items-start justify-between gap-3 space-y-0 pb-3'>
        <div className='min-w-0 space-y-1.5'>
          <div className='flex items-center gap-2'>
            <span className={cn("size-2 shrink-0 rounded-full", config.dot)} />
            <CardTitle className='text-base leading-none'>{check.name}</CardTitle>
          </div>
          <CardDescription className='text-xs leading-relaxed'>{check.description}</CardDescription>
        </div>

        <Button
          variant='ghost'
          size='icon-sm'
          onClick={refresh}
          disabled={isPending}
          aria-label={`Refresh ${check.name}`}
          className='shrink-0 opacity-60 transition-opacity group-hover:opacity-100'
        >
          <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} />
        </Button>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
            config.badge,
          )}
        >
          {config.label}
        </div>

        {check.message && (
          <p className='text-sm leading-relaxed text-muted-foreground'>{check.message}</p>
        )}

        {(check.latencyMs !== null || check.details) && (
          <div className='flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground'>
            {check.latencyMs !== null && (
              <span>
                Latency <span className='font-medium text-foreground'>{check.latencyMs} ms</span>
              </span>
            )}
            {check.details &&
              Object.entries(check.details).map(([key, value]) => (
                <span key={key}>
                  {key}{" "}
                  <span className='font-medium text-foreground'>
                    {value === null || value === undefined ? "—" : String(value)}
                  </span>
                </span>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

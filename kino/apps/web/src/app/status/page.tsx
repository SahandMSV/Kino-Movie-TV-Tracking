import { StatusCard } from "@/components/features/status/status-card";
import { runAllChecks, type CheckStatus } from "@/lib/status/checks";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function overallConfig(status: CheckStatus) {
  switch (status) {
    case "operational":
      return {
        dot: "bg-emerald-500",
        border: "border-emerald-500/20",
        bg: "bg-emerald-500/5",
        text: "All systems operational",
        description: "Every checked service is responding normally.",
      };
    case "degraded":
      return {
        dot: "bg-amber-500",
        border: "border-amber-500/20",
        bg: "bg-amber-500/5",
        text: "Some systems degraded",
        description: "One or more services are slow or partially unavailable.",
      };
    case "down":
      return {
        dot: "bg-red-500",
        border: "border-red-500/20",
        bg: "bg-red-500/5",
        text: "Incidents detected",
        description: "One or more critical services are currently down.",
      };
  }
}

export default async function StatusPage() {
  const checks = await runAllChecks();

  const overall: CheckStatus = checks.some(c => c.status === "down")
    ? "down"
    : checks.some(c => c.status === "degraded")
      ? "degraded"
      : "operational";

  const config = overallConfig(overall);
  const operationalCount = checks.filter(c => c.status === "operational").length;

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      {/* Minimal top bar */}
      <header className='sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md'>
        <div className='mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6'>
          <div className='flex items-center gap-2.5'>
            <span className='text-sm font-semibold tracking-tight'>Kino</span>
            <span className='text-muted-foreground'>/</span>
            <span className='text-sm text-muted-foreground'>Status</span>
          </div>
          <span className='text-xs text-muted-foreground'>status.localhost</span>
        </div>
      </header>

      <main className='flex-1'>
        <div className='mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14'>
          {/* Overall status banner */}
          <div
            className={cn(
              "mb-10 flex items-start gap-4 rounded-xl border p-5 sm:p-6",
              config.border,
              config.bg,
            )}
          >
            <span className={cn("mt-1 size-3 shrink-0 rounded-full", config.dot)} />
            <div className='min-w-0 space-y-1'>
              <h1 className='text-xl font-semibold tracking-tight sm:text-2xl'>{config.text}</h1>
              <p className='text-sm text-muted-foreground'>{config.description}</p>
              <p className='pt-1 text-xs text-muted-foreground'>
                {operationalCount} of {checks.length} services operational
              </p>
            </div>
          </div>

          {/* Section label */}
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-sm font-medium text-muted-foreground'>Services</h2>
            <p className='text-xs text-muted-foreground'>Click the refresh icon on any card</p>
          </div>

          {/* Grid */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {checks.map(check => (
              <StatusCard key={check.id} initial={check} />
            ))}
          </div>

          <p className='mt-10 text-center text-xs text-muted-foreground'>
            Checks run on every request · Last updated {new Date().toLocaleString()}
          </p>
        </div>
      </main>
    </div>
  );
}

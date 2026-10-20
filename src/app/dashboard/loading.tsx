import { Loader2, ShieldCheck } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top indeterminate progress shimmer */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-border z-50 overflow-hidden">
        <div className="h-full bg-primary animate-[pulse_1s_infinite] w-full" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-card/80 rounded-xl animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-card/50 rounded-lg animate-pulse" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-mono text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          <span>CONNECTING SECURE SESSION...</span>
        </div>
      </div>

      {/* Card Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-border bg-card/40 flex items-center justify-between shadow-xs animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
              <div className="h-7 w-12 bg-muted-foreground/30 rounded" />
              <div className="h-3 w-24 bg-muted-foreground/10 rounded" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-background/80 border border-border/50" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="p-8 rounded-2xl border border-border bg-card/30 space-y-4 animate-pulse">
        <div className="h-5 w-48 bg-muted-foreground/20 rounded-md" />
        <div className="h-28 w-full bg-background/50 rounded-xl border border-border/50 flex items-center justify-center">
          <div className="flex items-center gap-2.5 text-xs font-mono text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Rendering requested console module...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

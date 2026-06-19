import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtext: string;
  trendType: "up" | "muted";
  icon: React.ReactNode;
}

// Shrink the value font as the string gets longer so big numbers stay inside the
// card. `value` may be a ReactNode (e.g. <MetricValue/>) — only string values can
// be measured; non-strings (already-compact components) use the largest size.
const valueSizeClass = (value: React.ReactNode) => {
  const len = typeof value === "string" ? value.length : 0;
  if (len <= 8) return "text-2xl";
  if (len <= 11) return "text-xl";
  if (len <= 15) return "text-lg";
  return "text-base";
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  trendType,
  icon,
}) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="flex flex-col justify-between h-full min-w-0">
        <div className="flex items-center justify-between gap-2 w-full pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </span>
          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
            {icon}
          </div>
        </div>
        <div className="mt-2 space-y-2 min-w-0">
          <div
            className={`${valueSizeClass(value)} font-bold text-foreground leading-none tabular-nums truncate`}
            title={typeof value === "string" ? value : undefined}
          >
            {value}
          </div>
          <div className="pt-1 min-w-0">
            {trendType === "up" ? (
              <span
                className="inline-flex max-w-full items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full overflow-hidden"
                title={subtext}
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                <span className="truncate">{subtext}</span>
              </span>
            ) : (
              <span
                className="inline-flex max-w-full items-center text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full overflow-hidden"
                title={subtext}
              >
                <span className="truncate">{subtext}</span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

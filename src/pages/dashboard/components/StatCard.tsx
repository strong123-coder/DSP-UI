import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  trendType: "up" | "muted";
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  trendType,
  icon,
}) => {
  return (
    <Card className="shadow-xs hover:shadow-md transition-shadow duration-300">
      <CardContent className="flex flex-col justify-between h-full">
        <div className="flex items-center justify-between space-y-0 w-full pb-2">
          <span className="text-xs font-semibold cursor-pointer text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div className="p-2 bg-blue-50 cursor-pointer dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
            {icon}
          </div>
        </div>
        <div className="mt-2 space-y-2">
          <div className="text-2xl font-bold text-foreground leading-none">
            {value}
          </div>
          <div className="pt-1">
            {trendType === "up" ? (
              <span className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                <span>{subtext}</span>
              </span>
            ) : (
              <span className="inline-flex cursor-pointer items-center text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {subtext}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

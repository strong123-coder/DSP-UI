import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface PerformanceChartProps {
  chartData: Array<{ date: string; "7 Days": number; "Previous 7 Days": number }>;
  metric: "install" | "spent" | "clicks" | "events" | "impression" | "re-engagement";
  onMetricChange: (metric: "install" | "spent" | "clicks" | "events" | "impression" | "re-engagement") => void;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  chartData,
  metric,
  onMetricChange,
}) => {
  return (
    <Card className="lg:col-span-7 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
        <div>
          <CardTitle className="text-base font-bold">Performance</CardTitle>
        </div>
        <Select value={metric} onValueChange={onMetricChange}>
          <SelectTrigger className="w-[120px] h-8 bg-card border-border/60">
            <SelectValue placeholder="Metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="install">Install</SelectItem>
            <SelectItem value="spent">Spent</SelectItem>
            <SelectItem value="clicks">Clicks</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="impression">Impression</SelectItem>
            <SelectItem value="re-engagement">Re-Engagement</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-6">
        {chartData.length === 0 ? (
          <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-border/80 rounded-lg text-muted-foreground bg-muted/5 gap-2">
            <span className="text-sm font-semibold text-foreground/80">No performance data</span>
            <span className="text-xs text-muted-foreground max-w-[250px] text-center">
              Configure campaign details or wait for incoming performance statistics.
            </span>
          </div>
        ) : (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="performanceBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="performanceGray" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dx={-5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="7 Days"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#performanceBlue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Previous 7 Days"
                    stroke="#64748b"
                    strokeWidth={2.0}
                    fillOpacity={1}
                    fill="url(#performanceGray)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>7 Days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                <span>Previous 7 Days</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

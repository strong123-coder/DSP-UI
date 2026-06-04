import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface GoalReportChartProps {
  metric?: string;
  goalReportData: Array<{ name: string; value: number }>;
  goalXDomain: number[];
}

export const GoalReportChart: React.FC<GoalReportChartProps> = ({
  goalReportData,
  goalXDomain,
}) => {
  return (
    <Card className="lg:col-span-5 shadow-xs">
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="text-base font-bold">Goal Report</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col justify-between h-[304px]">
        {goalReportData.length === 0 || goalReportData.every(d => d.value === 0) ? (
          <div className="h-44 w-full flex flex-col items-center justify-center border border-dashed border-border/80 rounded-lg text-muted-foreground bg-muted/5 gap-2">
            <span className="text-sm font-semibold text-foreground/80">No goal data</span>
            <span className="text-xs text-muted-foreground max-w-[200px] text-center">
              No goal report details recorded for the selected filters.
            </span>
          </div>
        ) : (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={goalReportData}
                margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.6} />
                <XAxis
                  type="number"
                  domain={goalXDomain}
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={5}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
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
                <Bar
                  dataKey="value"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="text-center text-xs font-semibold text-muted-foreground pb-2">
          Goal report showing bid count grouped by event name
        </div>
      </CardContent>
    </Card>
  );
};

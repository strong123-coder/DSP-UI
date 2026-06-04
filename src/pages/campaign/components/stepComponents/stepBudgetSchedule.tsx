import React from "react";
import { useFormContext } from "react-hook-form";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";

const StepBudgetSchedule: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AddCampaignFormValues>();

  return (
    <Card className="animate-in fade-in-50 duration-200 border-none shadow-none bg-transparent p-0">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" /> Budgeting &amp;
          Scheduling
        </CardTitle>
        <CardDescription>
          Allocate financial limits and select execution dates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Total Campaign Budget</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="budget"
                type="number"
                className="pl-9"
                placeholder="e.g. 50000"
                {...register("budget")}
              />
            </div>
            {errors.budget && (
              <p className="text-xs text-destructive">
                {errors.budget.message}
              </p>
            )}
          </div>

          {/* Daily Budget */}
          <div className="space-y-2">
            <Label htmlFor="dailyBudget">Daily Spending Cap</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="dailyBudget"
                type="number"
                className="pl-9"
                placeholder="e.g. 2000"
                {...register("dailyBudget")}
              />
            </div>
            {errors.dailyBudget && (
              <p className="text-xs text-destructive">
                {errors.dailyBudget.message}
              </p>
            )}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency Code</Label>
            <Input
              id="currency"
              placeholder="USD"
              {...register("currency")}
            />
            {errors.currency && (
              <p className="text-xs text-destructive">
                {errors.currency.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* KPI */}
          <div className="space-y-2">
            <Label htmlFor="kpi">Key Performance Indicator (KPI)</Label>
            <Input
              id="kpi"
              placeholder="e.g. CPA &lt; $5.00 or ROI &gt; 150%"
              {...register("kpi")}
            />
            {errors.kpi && (
              <p className="text-xs text-destructive">
                {errors.kpi.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepBudgetSchedule;

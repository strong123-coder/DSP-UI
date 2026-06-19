import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  abbreviateNumber,
  abbreviateCurrency,
  formatExactNumber,
  formatExactCurrency,
  formatPercent,
  isAbbreviated,
} from "@/lib/format";

interface MetricValueProps {
  value: number | null | undefined;
  /** Render as currency ($1.2M). */
  currency?: boolean;
  /** Render as a percentage (12.34%) — never abbreviated, no tooltip. */
  percent?: boolean;
  /** Decimal places in the abbreviated form. Default 1. */
  decimals?: number;
  /** Text shown when value is null/undefined (e.g. CPI with no installs). */
  nullText?: string;
  className?: string;
}

/**
 * Displays a metric compactly (1.2K / 3.4M / $1.1B). When the value is large
 * enough to be abbreviated, hovering reveals the exact figure in a tooltip.
 * null/undefined renders as `nullText` ("—" by default).
 */
export const MetricValue: React.FC<MetricValueProps> = ({
  value,
  currency = false,
  percent = false,
  decimals = 1,
  nullText = "—",
  className,
}) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className={cn("text-muted-foreground", className)}>{nullText}</span>;
  }

  if (percent) {
    return <span className={className}>{formatPercent(value)}</span>;
  }

  const display = currency
    ? abbreviateCurrency(value, decimals)
    : abbreviateNumber(value, decimals);

  // Only attach a tooltip when the compact form actually hides precision.
  if (!isAbbreviated(value)) {
    return <span className={className}>{display}</span>;
  }

  const exact = currency ? formatExactCurrency(value) : formatExactNumber(value);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("cursor-help", className)}>{display}</span>
      </TooltipTrigger>
      <TooltipContent>{exact}</TooltipContent>
    </Tooltip>
  );
};

export default MetricValue;

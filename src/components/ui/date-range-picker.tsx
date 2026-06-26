import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "src/lib/utils";
import { Button } from "src/components/ui/button";
import { Calendar } from "src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  className,
  value,
  onChange,
  placeholder = "Filter by Date Range",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(value);

  // Sync tempDate with value when popover opens or value changes
  React.useEffect(() => {
    setTempDate(value);
  }, [value, open]);

  const handleApply = () => {
    onChange(tempDate);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[260px] justify-start text-left font-normal border-border/80 hover:border-primary/50 transition-all rounded-xl shadow-xs relative pr-8",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} - {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
            {value?.from && (
              <button
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Clear date range"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex flex-col" align="end">
          <Calendar
            mode="range"
            defaultMonth={tempDate?.from}
            selected={tempDate}
            onSelect={setTempDate}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
          <div className="flex items-center justify-end gap-2 border-t border-border p-3 bg-muted/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="h-8 rounded-lg cursor-pointer"
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DatePickerProps {
  id?: string;
  name?: string;
  placeholder?: string;

  ariaInvalid?: boolean;
  className?: string;

  errorTooltip?: string;
  tooltip?: string;

  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: boolean;
}

export const DatePickerComponent = React.forwardRef<
  HTMLButtonElement,
  DatePickerProps
>(
  (
    {
      id,
      name,
      placeholder = "Pick a date",
      ariaInvalid = false,
      className,
      errorTooltip,
      tooltip,
      date,
      onSelect,
      disabled,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                id={id}
                ref={ref}
                name={name}
                variant="outline"
                disabled={disabled}
                className={cn(
                  "cursor-pointer w-full justify-start text-left font-normal bg-transparent dark:bg-input/30",
                  !date && "text-muted-foreground",
                  className,
                  ariaInvalid ? "!border-red-600" : "border-input",
                )}
                aria-invalid={ariaInvalid}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>{placeholder}</span>}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          {(errorTooltip || tooltip) && (
            <TooltipContent
              hideArrow={errorTooltip != ""}
              arrowClassName={errorTooltip != "" ? "bg-destructive" : ""}
              className={errorTooltip ? "bg-destructive font-semibold" : ""}
            >
              <p>{errorTooltip || tooltip}</p>
            </TooltipContent>
          )}
        </Tooltip>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              onSelect?.(d);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  },
);

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  id?: string;
  name?: string;
  placeholder?: string;
  title?: string;

  ariaInvalid?: boolean;
  className?: string;
  size?: "sm" | "default" | undefined;

  errorTooltip?: string;
  tooltip?: string;

  onValueChange?: (value: string) => void;
  value?: string;
  data?: Array<{ name: string; value: string }>;
  search?: boolean;
  disabled?: boolean;
}

const SelectComponent = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      id,
      name,
      placeholder,
      title,
      ariaInvalid = false,
      className,
      size = "default",
      errorTooltip,
      tooltip,
      onValueChange,
      value,
      data,
      search = false,
      disabled,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    if (search) {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  ref={ref}
                  id={id}
                  role="combobox"
                  aria-expanded={open}
                  aria-invalid={ariaInvalid}
                  disabled={disabled}
                  className={cn(
                    "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                    size === "default"
                      ? "data-[size=default]"
                      : "data-[size=sm]",
                    className,
                  )}
                >
                  <span className="line-clamp-1 flex-1 text-left flex items-center gap-2">
                    {value ? (
                      data?.find((d) => d.value === value)?.name
                    ) : (
                      <span className="text-muted-foreground">
                        {placeholder || "Select"}
                      </span>
                    )}
                  </span>
                  <ChevronDownIcon className="size-4 opacity-50" />
                </button>
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

          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder={title || "Search ..."} />
              <CommandList>
                <CommandEmpty>Not found</CommandEmpty>
                <CommandGroup>
                  {data?.map((d, index) => (
                    <CommandItem
                      key={index}
                      value={d.value}
                      keywords={[d.name]}
                      onSelect={() => {
                        if (onValueChange) onValueChange(d.value);
                        else console.warn("onValueChange required");
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 size-4",
                          value === d.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {d.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <>
        <Select
          name={name}
          disabled={disabled}
          onValueChange={(value) => {
            if (onValueChange) onValueChange(value);
            else console.warn("onValueChange required");
          }}
          value={value}
          key={value}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectTrigger
                id={id}
                ref={ref}
                aria-invalid={ariaInvalid}
                className={`cursor-pointer w-full ${className || ""}`}
                size={size}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
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

          <SelectContent>
            <SelectGroup>
              <SelectLabel>{title || "select"}</SelectLabel>
              {data?.map((d, index) => (
                <SelectItem
                  key={index}
                  value={d.value}
                  className="cursor-pointer"
                >
                  {d.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </>
    );
  },
);

export default SelectComponent;

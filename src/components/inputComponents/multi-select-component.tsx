import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "../ui/multi-select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface MultiSelectProps {
  id?: string;
  name?: string;
  placeholder?: string;
  title?: string;

  ariaInvalid?: boolean;
  className?: string;

  errorTooltip?: string;
  tooltip?: string;

  onValuesChange?: (value: string[]) => void;
  values?: string[];
  data?: Array<{ name: string; value: string }>;

  disabled?: boolean;
}

import React from "react";

const MultiSelectComponent = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      id,
      placeholder,
      title,
      ariaInvalid = false,
      className,
      errorTooltip,
      tooltip,
      onValuesChange,
      values,
      data,
      disabled,
    },
    ref,
  ) => {
    return (
      <>
        <MultiSelect
          onValuesChange={(value: string[]) => {
            if (onValuesChange) {
              if (value.includes("all")) {
                const hadAll = values?.includes("all");
                if (hadAll) {
                  // If "all" was already selected and value changed, they clicked something else, or deselected "all"
                  const filtered = value.filter((v) => v !== "all");
                  onValuesChange(filtered);
                } else {
                  // "all" was newly selected, clear everything else
                  onValuesChange(["all"]);
                }
              } else {
                onValuesChange(value);
              }
            } else {
              console.warn("onValueChange required");
            }
          }}
          values={values}
        >
          <Tooltip>
            <TooltipTrigger disabled={disabled} asChild>
              <MultiSelectTrigger
                id={id}
                ref={ref}
                ariaInvalid={ariaInvalid}
                className={`w-full ${className || ""}`}
              >
                <MultiSelectValue placeholder={placeholder || "Select"} />
              </MultiSelectTrigger>
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

          <MultiSelectContent
            search={{
              placeholder: title || "Search ...",
              emptyMessage: "Not found",
            }}
          >
            {data?.map((d, index) => {
              const isAllSelected = values?.includes("all");
              const isItemDisabled = isAllSelected && d.value !== "all";

              return (
                <MultiSelectItem
                  key={index}
                  value={d.value}
                  disabled={isItemDisabled}
                >
                  {d.name}
                </MultiSelectItem>
              );
            })}
          </MultiSelectContent>
        </MultiSelect>
      </>
    );
  },
);

export default MultiSelectComponent;

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

const MultiSelectComponent = ({
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
}: MultiSelectProps) => {
  return (
    <>
      <MultiSelect
        onValuesChange={(value: string[]) => {
          if (onValuesChange) onValuesChange(value);
          else console.warn("onValueChange required");
        }}
        values={values}
      >
        <Tooltip>
          <TooltipTrigger disabled={disabled} asChild>
            <MultiSelectTrigger
              id={id}
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
          {data?.map((d, index) => (
            <MultiSelectItem key={index} value={d.value}>
              {d.name}
            </MultiSelectItem>
          ))}
        </MultiSelectContent>
      </MultiSelect>
    </>
  );
};

export default MultiSelectComponent;

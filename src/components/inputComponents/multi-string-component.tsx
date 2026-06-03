import { PlusIcon, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface MultiStringProps {
  id?: string;
  label?: string;
  ariaInvalid?: boolean;
  errorTooltip?: string;
  disabled?: boolean;
  emptyNotAllowed?: boolean;
  emptyNotAllowedTooltip?: string;
  data: string[];
  setData: (value: string[]) => void;
}

const MultiStringComponent = ({
  id,
  label = "Add",
  ariaInvalid = false,
  errorTooltip,
  disabled = false,
  emptyNotAllowed = false,
  emptyNotAllowedTooltip = "Should not be empty",
  data = [],
  setData,
}: MultiStringProps) => {
  const addField = () => {
    setData([...data, ""]);
  };

  const updateField = (index: number, value: string) => {
    const newData = [...data];
    newData[index] = value;
    setData(newData);
  };

  const removeField = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  return (
    <div className={`grid gap-3`}>
      <div className="relative flex items-center justify-between">
        <Label
          htmlFor={disabled ? "" : id}
          className={`${disabled ? "text-gray-400" : ""}`}
        >
          {label}
        </Label>

        <Button
          id={id}
          variant="ghost"
          className="absolute right-0 cursor-pointer"
          onClick={addField}
          type="button"
          disabled={disabled}
        >
          <PlusIcon strokeWidth={2} style={{ width: 20, height: 20 }} />
        </Button>
      </div>

      <div className="space-y-2">
        {data.map((value, index) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <Input
              placeholder="Enter user Id"
              value={value}
              onChange={(e) => updateField(index, e.target.value)}
              aria-invalid={
                emptyNotAllowed && data.length > 1
                  ? value.trim() == ""
                    ? true
                    : false
                  : ariaInvalid
              }
              errorTooltip={
                emptyNotAllowed && data.length > 1
                  ? value.trim() == ""
                    ? emptyNotAllowedTooltip
                    : ""
                  : errorTooltip
              }
              disabled={disabled}
            />

            <Button
              variant="ghost"
              className="text-destructive rounded-full cursor-pointer"
              onClick={() => removeField(index)}
              type="button"
              disabled={disabled}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiStringComponent;

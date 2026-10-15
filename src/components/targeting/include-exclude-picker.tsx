import React from "react";
import { Label } from "@/components/ui/label";
import MultiSelectComponent from "@/components/inputComponents/multi-select-component";
import SelectedChips from "./selected-chips";

export interface IncludeExcludeValue {
  include: string[];
  exclude: string[];
}

// Include + exclude pickers over a fixed list of choices, with the selected
// items on the right. Picking a value on one side removes it from the other.
const IncludeExcludePicker: React.FC<{
  id: string;
  data: Array<{ name: string; value: string }>;
  value: IncludeExcludeValue;
  onChange: (v: IncludeExcludeValue) => void;
  includePlaceholder?: string;
  empty: string;
}> = ({ id, data, value, onChange, includePlaceholder = "No limit", empty }) => {
  const nameOf = (v: string) => data.find((d) => d.value === v)?.name || v;
  const setInclude = (include: string[]) =>
    onChange({ include, exclude: value.exclude.filter((v) => !include.includes(v)) });
  const setExclude = (exclude: string[]) =>
    onChange({ include: value.include.filter((v) => !exclude.includes(v)), exclude });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2 min-w-0">
        <Label htmlFor={`${id}-include`}>Include</Label>
        <MultiSelectComponent id={`${id}-include`} placeholder={includePlaceholder} data={data}
          values={value.include} onValuesChange={setInclude} className="w-full" />
        <Label htmlFor={`${id}-exclude`} className="pt-2 block">Exclude</Label>
        <MultiSelectComponent id={`${id}-exclude`} placeholder="No exclusions" data={data}
          values={value.exclude} onValuesChange={setExclude} className="w-full" />
      </div>
      <div className="space-y-2 min-w-0">
        <Label>Selected</Label>
        <SelectedChips include={value.include} exclude={value.exclude} empty={empty} label={nameOf}
          onRemove={(v, side) =>
            side === "include" ? setInclude(value.include.filter((x) => x !== v)) : setExclude(value.exclude.filter((x) => x !== v))
          } />
      </div>
    </div>
  );
};

export default IncludeExcludePicker;

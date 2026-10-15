import React, { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Globe, MapPin, Plus, Trash2, Users, Shuffle, CheckCircle2, Ban } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectComponent from "@/components/inputComponents/select-component";
import MultiSelectComponent from "@/components/inputComponents/multi-select-component";
import { geoData } from "@/utils/data/data";
import { AudienceTargetData, InventoryTypeData } from "@/utils/data/campaignData";
import type { LineItemFormValues } from "@/utils/schemas/lineItem";

type SubTab = "geo" | "segments" | "exchange";
const SUB_TABS: Array<{ id: SubTab; label: string; icon: React.ReactNode }> = [
  { id: "geo", label: "Geo", icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: "segments", label: "Segments", icon: <Users className="w-3.5 h-3.5" /> },
  { id: "exchange", label: "Exchange", icon: <Shuffle className="w-3.5 h-3.5" /> },
];

const countryName = (code: string) => geoData.find((g) => g.value === code)?.name || code;

// Chips listing what a rule includes / excludes (the screenshots' right panel).
const Selected: React.FC<{ include?: string[]; exclude?: string[]; empty: string; label?: (v: string) => string }> = ({
  include = [],
  exclude = [],
  empty,
  label = (v) => v,
}) => (
  <div className="rounded-lg bg-muted/40 border border-border/60 p-3 min-h-[44px] flex flex-wrap gap-1.5 items-center">
    {include.length === 0 && exclude.length === 0 && <span className="text-xs text-muted-foreground">{empty}</span>}
    {include.map((v) => (
      <span key={`i-${v}`} className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" /> {label(v)}
      </span>
    ))}
    {exclude.map((v) => (
      <span key={`e-${v}`} className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
        <Ban className="w-3 h-3" /> {label(v)}
      </span>
    ))}
  </div>
);

const GeoPanel: React.FC = () => {
  const { control, register, watch } = useFormContext<LineItemFormValues>();
  const include = watch("targeting.geo.countries.include") || [];
  const exclude = watch("targeting.geo.countries.exclude") || [];
  const { fields, append, remove } = useFieldArray({ control, name: "targeting.geo.custom" });
  const countryOptions = geoData.map((g) => ({ name: g.name, value: g.value }));

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Country</CardTitle>
          <CardDescription>Include the countries to run in, and exclude any you never want. No includes means every country.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 min-w-0">
            <Label>Include</Label>
            <Controller
              name="targeting.geo.countries.include"
              control={control}
              render={({ field }) => (
                <MultiSelectComponent
                  ref={field.ref}
                  placeholder="All countries"
                  data={countryOptions}
                  values={field.value || []}
                  onValuesChange={field.onChange}
                  className="w-full"
                />
              )}
            />
            <Label className="pt-2 block">Exclude</Label>
            <Controller
              name="targeting.geo.countries.exclude"
              control={control}
              render={({ field }) => (
                <MultiSelectComponent
                  ref={field.ref}
                  placeholder="No exclusions"
                  data={countryOptions}
                  values={field.value || []}
                  onValuesChange={field.onChange}
                  className="w-full"
                />
              )}
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label>Selected</Label>
            <Selected include={include} exclude={exclude} empty="No specific country targeted · runs everywhere" label={countryName} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-3">
          <div>
            <CardTitle className="text-base">Region / State &amp; City</CardTitle>
            <CardDescription>
              Narrow to specific regions or cities. When rows exist, they replace the country include list. Exclusions
              still apply.
            </CardDescription>
          </div>
          <Button type="button" size="sm" variant="outline" className="gap-1 shrink-0"
            onClick={() => append({ country: include[0] || "", state: "", city: "" })}>
            <Plus className="w-3.5 h-3.5" /> Add row
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.length === 0 ? (
            <div className="text-center py-5 text-muted-foreground border border-dashed border-border rounded-xl text-xs">
              No region or city rules.
            </div>
          ) : (
            fields.map((f, idx) => (
              <div key={f.id} className="flex gap-3 items-end bg-muted/5 border border-border p-3 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-w-0">
                  <div className="space-y-1.5">
                    <Label className="text-xs" htmlFor={`geo-custom-${idx}-country`}>Country</Label>
                    <Input id={`geo-custom-${idx}-country`} placeholder="IN" {...register(`targeting.geo.custom.${idx}.country` as const)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs" htmlFor={`geo-custom-${idx}-state`}>Region / State</Label>
                    <Input id={`geo-custom-${idx}-state`} placeholder="Any" {...register(`targeting.geo.custom.${idx}.state` as const)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs" htmlFor={`geo-custom-${idx}-city`}>City</Label>
                    <Input id={`geo-custom-${idx}-city`} placeholder="Any" {...register(`targeting.geo.custom.${idx}.city` as const)} />
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label="Remove row" onClick={() => remove(idx)}
                  className="text-destructive hover:bg-destructive/10 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Free-text tag list (audience IDs, partner IDs).
const TagInput: React.FC<{ id: string; values: string[]; onChange: (v: string[]) => void; placeholder: string }> = ({
  id,
  values,
  onChange,
  placeholder,
}) => {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setText("");
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input id={id} value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }} />
        <Button type="button" variant="outline" onClick={add}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span key={v} className="inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
            {v}
            <button type="button" aria-label={`Remove ${v}`} className="hover:text-destructive" onClick={() => onChange(values.filter((_, j) => j !== i))}>
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

const SegmentsPanel: React.FC = () => {
  const { control, watch, setValue } = useFormContext<LineItemFormValues>();
  const target = watch("targeting.segments.audienceTarget");
  const ids = watch("targeting.segments.customAudienceIds") || [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Audience</CardTitle>
        <CardDescription>Reach everyone eligible, or only listed audience segments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="audienceTarget">Audience</Label>
          <Controller
            name="targeting.segments.audienceTarget"
            control={control}
            render={({ field }) => (
              <SelectComponent ref={field.ref} id="audienceTarget" value={field.value} onValueChange={field.onChange} data={AudienceTargetData} />
            )}
          />
        </div>
        {target === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="audienceIds">Audience IDs</Label>
            <TagInput id="audienceIds" values={ids} placeholder="Audience segment ID"
              onChange={(v) => setValue("targeting.segments.customAudienceIds", v, { shouldDirty: true })} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ExchangePanel: React.FC = () => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const type = watch("targeting.exchange.inventoryType");
  const partners = watch("targeting.exchange.oemPremiumPartners") || [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Shuffle className="w-4 h-4 text-primary" /> Inventory</CardTitle>
        <CardDescription>Where the ads may appear.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup" aria-label="Inventory type">
          {InventoryTypeData.map((item) => (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={type === item.value}
              onClick={() => setValue("targeting.exchange.inventoryType", item.value, { shouldDirty: true })}
              className={`text-left rounded-xl border-2 p-4 transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                type === item.value ? "border-primary bg-primary/5" : "border-border hover:border-ring/40"
              }`}
            >
              <div className="font-semibold text-sm">{item.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
            </button>
          ))}
        </div>
        {type === "oem_premium_partners" && (
          <div className="space-y-2">
            <Label htmlFor="oemPartners">Partners</Label>
            <TagInput id="oemPartners" values={partners} placeholder="Partner ID"
              onChange={(v) => setValue("targeting.exchange.oemPremiumPartners", v, { shouldDirty: true })} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TargetingTab: React.FC = () => {
  const [sub, setSub] = useState<SubTab>("geo");
  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap" role="tablist" aria-label="Targeting">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={sub === t.id}
            onClick={() => setSub(t.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
              sub === t.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {sub === "geo" && <GeoPanel />}
      {sub === "segments" && <SegmentsPanel />}
      {sub === "exchange" && <ExchangePanel />}
    </div>
  );
};

export default TargetingTab;

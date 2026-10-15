import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  AppWindow,
  Clock,
  Globe,
  Handshake,
  Layers,
  MapPin,
  MonitorSmartphone,
  Radio,
  Plus,
  Shuffle,
  Smartphone,
  Tags,
  Trash2,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import SelectComponent from "@/components/inputComponents/select-component";
import IncludeExcludePicker from "@/components/targeting/include-exclude-picker";
import SelectedChips from "@/components/targeting/selected-chips";
import ValuesInput from "@/components/targeting/values-input";
import TextIncludeExclude from "@/components/targeting/text-include-exclude";
import ScheduleGrid from "@/components/targeting/schedule-grid";
import { geoData } from "@/utils/data/data";
import { AudienceTargetData, InventoryTypeData } from "@/utils/data/campaignData";
import { LanguageData, SegmentData, timezoneData } from "@/utils/data/targetingData";
import { useAdvertiserCategories } from "@/query/useAdvertiser";
import { useTargetingOptions } from "@/query/useLineItem";
import { useTargetingListOptions } from "@/query/useTargetingList";
import type { TargetingOptions } from "@/services/lineItem";
import type { LineItemFormValues } from "@/utils/schemas/lineItem";

type SubTab = "geo" | "app" | "content" | "environment" | "platform" | "time" | "segments" | "exchange";

const SUB_TABS: Array<{ id: SubTab; label: string; icon: React.ReactNode }> = [
  { id: "geo", label: "Geo", icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: "app", label: "App/Site", icon: <AppWindow className="w-3.5 h-3.5" /> },
  { id: "content", label: "Content", icon: <Tags className="w-3.5 h-3.5" /> },
  { id: "environment", label: "Environment", icon: <Layers className="w-3.5 h-3.5" /> },
  { id: "platform", label: "Platform", icon: <Smartphone className="w-3.5 h-3.5" /> },
  { id: "time", label: "Time", icon: <Clock className="w-3.5 h-3.5" /> },
  { id: "segments", label: "Segments", icon: <Users className="w-3.5 h-3.5" /> },
  { id: "exchange", label: "Exchange", icon: <Shuffle className="w-3.5 h-3.5" /> },
];

const dirty = { shouldDirty: true };
const countryName = (code: string) => geoData.find((g) => g.value === code)?.name || code;
const hasIE = (v?: { include: unknown[]; exclude: unknown[] }) => !!v && (v.include.length > 0 || v.exclude.length > 0);

// Which sub-tabs carry a rule, for the dot next to their label.
const activeSubTabs = (t: LineItemFormValues["targeting"]): Set<SubTab> => {
  const s = new Set<SubTab>();
  if (hasIE(t.geo.countries) || t.geo.custom.length || hasIE(t.geo.metros) || hasIE(t.geo.zips) || hasIE(t.geo.zipLists)) s.add("geo");
  if (hasIE(t.inventory.bundles) || hasIE(t.inventory.bundleLists) || hasIE(t.inventory.deals) || hasIE(t.inventory.dealLists)) s.add("app");
  if (hasIE(t.content.categories) || hasIE(t.content.languages)) s.add("content");
  if (t.environment.channels.length) s.add("environment");
  if (hasIE(t.platform.deviceTypes) || hasIE(t.platform.connectionTypes) || hasIE(t.platform.makes) ||
    hasIE(t.platform.models) || hasIE(t.platform.carriers) || t.platform.osVersion.min || t.platform.osVersion.max) s.add("platform");
  if (t.time.slots.length) s.add("time");
  if (t.segments.retargeting.include.length || t.segments.retargeting.exclude.length || t.segments.requireDeviceId ||
    t.segments.audienceTarget === "custom") s.add("segments");
  if (hasIE(t.exchange.supplyPartners) || hasIE(t.exchange.zones) || t.exchange.inventoryType !== "programmatic") s.add("exchange");
  return s;
};

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <CardTitle className="text-base flex items-center gap-2">
    <span className="text-primary">{icon}</span> {children}
  </CardTitle>
);

/* ------------------------------------------------------------------ Geo */

const GeoPanel: React.FC = () => {
  const { control, register, watch, setValue } = useFormContext<LineItemFormValues>();
  const { data: zipResp } = useTargetingListOptions("zip");
  const zipLists: Array<{ id: string; value: string; count: number }> = zipResp?.data ?? [];
  const countries = watch("targeting.geo.countries");
  const { fields, append, remove } = useFieldArray({ control, name: "targeting.geo.custom" });
  const countryOptions = useMemo(() => geoData.map((g) => ({ name: g.name, value: g.value })), []);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <SectionTitle icon={<Globe className="w-4 h-4" />}>Country</SectionTitle>
          <CardDescription>Include the countries to run in, and exclude any you never want. No includes means every country.</CardDescription>
        </CardHeader>
        <CardContent>
          <IncludeExcludePicker id="geo-countries" data={countryOptions} value={countries}
            includePlaceholder="All countries" empty="No specific country targeted · runs everywhere"
            onChange={(v) => setValue("targeting.geo.countries", v, dirty)} />
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
            onClick={() => append({ country: countries.include[0] || "", state: "", city: "" })}>
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
          {countries.include.length > 0 && fields.length === 0 && (
            <p className="text-[11px] text-muted-foreground">Including: {countries.include.map(countryName).join(", ")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metro (DMA)</CardTitle>
          <CardDescription>Metro codes the exchange sends (e.g. 501 for New York). Requests without one never match an include.</CardDescription>
        </CardHeader>
        <CardContent>
          <TextIncludeExclude id="metros" value={watch("targeting.geo.metros")} placeholder="501"
            empty="Any metro" onChange={(v) => setValue("targeting.geo.metros", v, dirty)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
          <div>
            <CardTitle className="text-base">ZIP / postal code</CardTitle>
            <CardDescription>
              Exact codes; spaces and letter case are ignored, and a ZIP+4 also matches its 5-digit ZIP. Only works where
              your supply partners send postal codes.
            </CardDescription>
          </div>
          <Link to="/targeting-list/list?kind=zip" target="_blank" className="text-xs font-medium text-primary hover:underline shrink-0">
            Manage lists
          </Link>
        </CardHeader>
        <CardContent className="space-y-5">
          <TextIncludeExclude id="zips" value={watch("targeting.geo.zips")} placeholder="10001, SW1A 1AA"
            normalize={(v) => v.toLowerCase().replace(/\s+/g, "")} empty="Any postal code"
            onChange={(v) => setValue("targeting.geo.zips", v, dirty)} />
          <IncludeExcludePicker id="zip-lists" value={watch("targeting.geo.zipLists")}
            data={zipLists.map((l) => ({ name: `${l.value} (${l.count})`, value: l.id }))}
            includePlaceholder={zipLists.length ? "No ZIP list" : "No ZIP lists yet"} empty="No ZIP lists used"
            onChange={(v) => setValue("targeting.geo.zipLists", v, dirty)} />
        </CardContent>
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------- App/Site */

const AppSitePanel: React.FC<{ options?: TargetingOptions }> = ({ options }) => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const lists = watch("targeting.inventory.bundleLists");
  const deals = watch("targeting.inventory.deals");
  const { data: listResp } = useTargetingListOptions("bundle");
  const listOptions: Array<{ id: string; value: string; count: number }> = listResp?.data ?? [];
  const { data: dealListResp } = useTargetingListOptions("deal");
  const dealLists: Array<{ id: string; value: string; count: number }> = dealListResp?.data ?? [];

  // Deals arranged with supply partners, plus any id typed in by hand.
  const known = options?.deals ?? [];
  const dealData = [
    ...known.map((d) => ({
      name: `${d.name || d.dealId} · ${d.partner}${d.floorCpm ? ` · ${d.floorCpm} ${d.currency}` : ""}`,
      value: d.dealId,
    })),
    ...[...deals.include, ...deals.exclude]
      .filter((id) => !known.some((d) => d.dealId === id))
      .map((id) => ({ name: id, value: id })),
  ];

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <SectionTitle icon={<AppWindow className="w-4 h-4" />}>App bundles &amp; site domains</SectionTitle>
          <CardDescription>
            Matched against the app's bundle ID in apps and the site's domain on the web. Paste many at once, one per line
            or comma-separated. For long lists, use a reusable list below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TextIncludeExclude id="bundles" value={watch("targeting.inventory.bundles")}
            placeholder="com.example.app or news.example.com" empty="Any app or site"
            onChange={(v) => setValue("targeting.inventory.bundles", v, dirty)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
          <div>
            <CardTitle className="text-base">Bundle lists</CardTitle>
            <CardDescription>Reusable lists shared across line items. Editing a list updates every line item that uses it.</CardDescription>
          </div>
          <Link to="/targeting-list/list" target="_blank" className="text-xs font-medium text-primary hover:underline shrink-0">
            Manage lists
          </Link>
        </CardHeader>
        <CardContent>
          <IncludeExcludePicker id="bundle-lists" value={lists}
            data={listOptions.map((l) => ({ name: `${l.value} (${l.count})`, value: l.id }))}
            includePlaceholder={listOptions.length ? "No list" : "No lists yet"} empty="No lists used"
            onChange={(v) => setValue("targeting.inventory.bundleLists", v, dirty)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <SectionTitle icon={<Handshake className="w-4 h-4" />}>Deals</SectionTitle>
          <CardDescription>
            Private marketplace deals. Including deals makes this line item deal-only: it bids only through one of them, at
            the deal's floor or fixed price. Excluded deals skip any impression that offers them. With no deals, it buys the
            open auction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <IncludeExcludePicker id="deals" data={dealData} value={deals}
            includePlaceholder={dealData.length ? "No deals (open auction)" : "No deals set up"} empty="Open auction only"
            onChange={(v) => setValue("targeting.inventory.deals", v, dirty)} />
          <div className="space-y-2 max-w-md">
            <Label htmlFor="deal-id-input">Deal not listed? Add its ID</Label>
            <ValuesInput id="deal-id-input" placeholder="Deal ID from the seller" normalize={(v) => v}
              onAdd={(ids) =>
                setValue("targeting.inventory.deals", {
                  include: [...new Set([...deals.include, ...ids])],
                  exclude: deals.exclude.filter((d) => !ids.includes(d)),
                }, dirty)
              } />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Deal lists</Label>
              <Link to="/targeting-list/list?kind=deal" target="_blank" className="text-xs font-medium text-primary hover:underline">
                Manage lists
              </Link>
            </div>
            <IncludeExcludePicker id="deal-lists" value={watch("targeting.inventory.dealLists")}
              data={dealLists.map((l) => ({ name: `${l.value} (${l.count})`, value: l.id }))}
              includePlaceholder={dealLists.length ? "No deal list" : "No deal lists yet"} empty="No deal lists used"
              onChange={(v) => setValue("targeting.inventory.dealLists", v, dirty)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* -------------------------------------------------------------- Content */

const ContentPanel: React.FC = () => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const { data: catResp } = useAdvertiserCategories();
  const categories: Array<{ id: string; value: string }> = catResp?.data ?? [];
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <SectionTitle icon={<Tags className="w-4 h-4" />}>Content category</SectionTitle>
          <CardDescription>
            IAB categories the app or site declares. A category covers its sub-categories (IAB9 covers IAB9-30). Requests
            without a category never match an include.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IncludeExcludePicker id="categories" value={watch("targeting.content.categories")}
            data={categories.map((c) => ({ name: c.value, value: c.id }))} includePlaceholder="Any category"
            empty="Any category" onChange={(v) => setValue("targeting.content.categories", v, dirty)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <SectionTitle icon={<Globe className="w-4 h-4" />}>Language</SectionTitle>
          <CardDescription>The device language. Requests without one never match an include.</CardDescription>
        </CardHeader>
        <CardContent>
          <IncludeExcludePicker id="languages" value={watch("targeting.content.languages")} data={LanguageData}
            includePlaceholder="Any language" empty="Any language"
            onChange={(v) => setValue("targeting.content.languages", v, dirty)} />
        </CardContent>
      </Card>
    </div>
  );
};

/* ---------------------------------------------------------- Environment */

const EnvironmentPanel: React.FC<{ campaignType: string }> = ({ campaignType }) => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const channels = watch("targeting.environment.channels");
  const toggle = (c: "app" | "web") =>
    setValue("targeting.environment.channels", channels.includes(c) ? channels.filter((x) => x !== c) : [...channels, c], dirty);
  const note =
    campaignType === "web"
      ? "Web campaigns only ever buy web inventory."
      : campaignType === "ctv"
        ? "CTV campaigns buy app and connected-TV inventory."
        : "Mobile campaigns buy in-app and mobile web on devices that can install the app.";
  const options = [
    { id: "app" as const, title: "In-app", desc: "Ads inside mobile and CTV apps." },
    { id: "web" as const, title: "Mobile web", desc: "Ads on websites opened in a browser." },
  ];
  return (
    <Card>
      <CardHeader>
        <SectionTitle icon={<Layers className="w-4 h-4" />}>Environment</SectionTitle>
        <CardDescription>Pick where the ads may run. Pick none to allow both. {note}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((o) => {
          const on = channels.includes(o.id);
          return (
            <button key={o.id} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(o.id)}
              className={`text-left rounded-xl border-2 p-4 transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                on ? "border-primary bg-primary/5" : "border-border hover:border-ring/40"
              }`}>
              <div className="font-semibold text-sm">{o.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{o.desc}</div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};

/* ------------------------------------------------------------- Platform */

const PlatformPanel: React.FC<{ options?: TargetingOptions }> = ({ options }) => {
  const { watch, setValue, register, formState: { errors } } = useFormContext<LineItemFormValues>();
  const dt = watch("targeting.platform.deviceTypes");
  const ct = watch("targeting.platform.connectionTypes");
  const data = (options?.deviceTypes ?? []).map((d) => ({ name: d.name, value: String(d.value) }));
  const connData = (options?.connectionTypes ?? []).map((d) => ({ name: d.name, value: String(d.value) }));
  const osvErr = errors.targeting?.platform?.osVersion;
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <SectionTitle icon={<MonitorSmartphone className="w-4 h-4" />}>Device type</SectionTitle>
          <CardDescription>The OpenRTB device type the request reports. The app's OS comes from the campaign.</CardDescription>
        </CardHeader>
        <CardContent>
          <IncludeExcludePicker id="device-types" data={data} includePlaceholder="Any device"
            empty="Any device type"
            value={{ include: dt.include.map(String), exclude: dt.exclude.map(String) }}
            onChange={(v) =>
              setValue("targeting.platform.deviceTypes", { include: v.include.map(Number), exclude: v.exclude.map(Number) }, dirty)
            } />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Device make &amp; model</CardTitle>
          <CardDescription>As the request reports them (e.g. make "Samsung", model "SM-A515F"). Letter case is ignored.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Make</div>
            <TextIncludeExclude id="makes" value={watch("targeting.platform.makes")} placeholder="samsung, xiaomi"
              empty="Any make" onChange={(v) => setValue("targeting.platform.makes", v, dirty)} />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model</div>
            <TextIncludeExclude id="models" value={watch("targeting.platform.models")} placeholder="sm-a515f"
              empty="Any model" onChange={(v) => setValue("targeting.platform.models", v, dirty)} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <SectionTitle icon={<Radio className="w-4 h-4" />}>Network</SectionTitle>
          <CardDescription>Mobile carrier and connection type. Requests that don't report them never match an include.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <IncludeExcludePicker id="connection-types" data={connData} includePlaceholder="Any connection"
            empty="Any connection type"
            value={{ include: ct.include.map(String), exclude: ct.exclude.map(String) }}
            onChange={(v) =>
              setValue("targeting.platform.connectionTypes", { include: v.include.map(Number), exclude: v.exclude.map(Number) }, dirty)
            } />
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Carrier</div>
            <TextIncludeExclude id="carriers" value={watch("targeting.platform.carriers")} placeholder="jio, airtel"
              empty="Any carrier" onChange={(v) => setValue("targeting.platform.carriers", v, dirty)} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <SectionTitle icon={<Smartphone className="w-4 h-4" />}>OS version</SectionTitle>
          <CardDescription>
            Useful when the app needs a minimum OS. A bound like "12" covers every 12.x. Requests without a version never
            match when a bound is set.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="osv-min">Minimum</Label>
            <Input id="osv-min" placeholder="Any, e.g. 10" {...register("targeting.platform.osVersion.min")}
              aria-invalid={!!osvErr?.min} errorTooltip={osvErr?.min?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="osv-max">Maximum</Label>
            <Input id="osv-max" placeholder="Any, e.g. 14" {...register("targeting.platform.osVersion.max")}
              aria-invalid={!!osvErr?.max} errorTooltip={osvErr?.max?.message} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ----------------------------------------------------------------- Time */

const TimePanel: React.FC = () => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const time = watch("targeting.time");
  const zones = useMemo(() => timezoneData(), []);
  return (
    <Card>
      <CardHeader>
        <SectionTitle icon={<Clock className="w-4 h-4" />}>Time of week</SectionTitle>
        <CardDescription>Pick the hours this line item bids in. Leave the grid empty to bid at every hour.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="timezone">Timezone</Label>
          <SelectComponent id="timezone" search value={time.timezone} data={zones}
            onValueChange={(v) => setValue("targeting.time.timezone", v, dirty)} />
        </div>
        <ScheduleGrid value={time.slots} onChange={(slots) => setValue("targeting.time.slots", slots, dirty)} />
      </CardContent>
    </Card>
  );
};

/* ------------------------------------------------------------- Segments */

type RetargetRow = { side: "include" | "exclude"; campaignId: string | null; segment: "clickers" | "viewers" | "any" };

const SegmentsPanel: React.FC<{ campaignId: string; options?: TargetingOptions }> = ({ campaignId, options }) => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const target = watch("targeting.segments.audienceTarget");
  const ids = watch("targeting.segments.customAudienceIds") || [];
  const rt = watch("targeting.segments.retargeting");
  const requireId = watch("targeting.segments.requireDeviceId");

  const rows: RetargetRow[] = [
    ...rt.include.map((r) => ({ ...r, side: "include" as const })),
    ...rt.exclude.map((r) => ({ ...r, side: "exclude" as const })),
  ];
  const save = (next: RetargetRow[]) =>
    setValue(
      "targeting.segments.retargeting",
      {
        include: next.filter((r) => r.side === "include").map(({ campaignId: c, segment }) => ({ campaignId: c, segment })),
        exclude: next.filter((r) => r.side === "exclude").map(({ campaignId: c, segment }) => ({ campaignId: c, segment })),
      },
      dirty,
    );
  const campaignChoices = [
    { name: "This campaign", value: "__self__" },
    ...(options?.campaigns ?? []).filter((c) => c.id !== campaignId).map((c) => ({ name: c.title, value: c.id })),
  ];

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
          <div>
            <SectionTitle icon={<Users className="w-4 h-4" />}>Retargeting audiences</SectionTitle>
            <CardDescription>
              People who saw or clicked a campaign's ads, by advertising ID, for as long as the engine keeps them (1 day by
              default). With includes, the line item bids only on people in at least one; excludes block anyone in them.
            </CardDescription>
          </div>
          <Button type="button" size="sm" variant="outline" className="gap-1 shrink-0" disabled={rows.length >= 20}
            onClick={() => save([...rows, { side: "include", campaignId: null, segment: "any" }])}>
            <Plus className="w-3.5 h-3.5" /> Add audience
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <div className="text-center py-5 text-muted-foreground border border-dashed border-border rounded-xl text-xs">
              No audience rules: anyone eligible can see the ads.
            </div>
          ) : (
            rows.map((r, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-center">
                <SelectComponent id={`rt-${i}-side`} value={r.side}
                  data={[{ name: "Include", value: "include" }, { name: "Exclude", value: "exclude" }]}
                  onValueChange={(v) => save(rows.map((x, j) => (j === i ? { ...x, side: v as RetargetRow["side"] } : x)))} />
                <SelectComponent id={`rt-${i}-campaign`} search value={r.campaignId || "__self__"} data={campaignChoices}
                  onValueChange={(v) => save(rows.map((x, j) => (j === i ? { ...x, campaignId: v === "__self__" ? null : v } : x)))} />
                <SelectComponent id={`rt-${i}-segment`} value={r.segment} data={SegmentData}
                  onValueChange={(v) => save(rows.map((x, j) => (j === i ? { ...x, segment: v as RetargetRow["segment"] } : x)))} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove audience"
                  className="text-destructive hover:bg-destructive/10" onClick={() => save(rows.filter((_, j) => j !== i))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="requireDeviceId" className="text-sm">Only bid when the device has an advertising ID</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Skips requests with no ID or a zeroed one (limited ad tracking), where installs usually can't be attributed.
            </p>
          </div>
          <Switch id="requireDeviceId" checked={requireId}
            onCheckedChange={(v) => setValue("targeting.segments.requireDeviceId", v, dirty)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom audiences</CardTitle>
          <CardDescription>Audience segment IDs from your data partner. Saved with the line item; not used for bidding yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="audienceTarget">Audience</Label>
            <SelectComponent id="audienceTarget" value={target} data={AudienceTargetData}
              onValueChange={(v) => setValue("targeting.segments.audienceTarget", v as "all" | "custom", dirty)} />
          </div>
          {target === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="audienceIds">Audience IDs</Label>
              <ValuesInput id="audienceIds" placeholder="Audience segment ID"
                onAdd={(v) => setValue("targeting.segments.customAudienceIds", [...new Set([...ids, ...v])], dirty)} />
              <SelectedChips include={ids} empty="No IDs yet"
                onRemove={(v) => setValue("targeting.segments.customAudienceIds", ids.filter((x) => x !== v), dirty)} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------- Exchange */

const ExchangePanel: React.FC<{ options?: TargetingOptions }> = ({ options }) => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const type = watch("targeting.exchange.inventoryType");
  const partners = watch("targeting.exchange.oemPremiumPartners") || [];
  const sp = options?.supplyPartners ?? [];
  const partnerData = sp.map((p) => ({ name: p.status === "active" ? p.name : `${p.name} (${p.status})`, value: p.id }));
  const zoneData = sp.flatMap((p) => p.zones.map((z) => ({ name: `${z.name ? `${z.name} · ` : ""}${z.zoneId} (${p.name})`, value: z.zoneId })));

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <SectionTitle icon={<Shuffle className="w-4 h-4" />}>Supply partners</SectionTitle>
          <CardDescription>The exchanges and publishers the traffic comes from.</CardDescription>
        </CardHeader>
        <CardContent>
          <IncludeExcludePicker id="supply-partners" data={partnerData} value={watch("targeting.exchange.supplyPartners")}
            includePlaceholder={partnerData.length ? "Any partner" : "No partners set up"} empty="Any supply partner"
            onChange={(v) => setValue("targeting.exchange.supplyPartners", v, dirty)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zones</CardTitle>
          <CardDescription>Individual placements (the zone a request arrives on).</CardDescription>
        </CardHeader>
        <CardContent>
          <IncludeExcludePicker id="zones" data={zoneData} value={watch("targeting.exchange.zones")}
            includePlaceholder={zoneData.length ? "Any zone" : "No zones set up"} empty="Any zone"
            onChange={(v) => setValue("targeting.exchange.zones", v, dirty)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventory</CardTitle>
          <CardDescription>Where the ads may appear.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup" aria-label="Inventory type">
            {InventoryTypeData.map((item) => (
              <button key={item.value} type="button" role="radio" aria-checked={type === item.value}
                onClick={() => setValue("targeting.exchange.inventoryType", item.value, dirty)}
                className={`text-left rounded-xl border-2 p-4 transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                  type === item.value ? "border-primary bg-primary/5" : "border-border hover:border-ring/40"
                }`}>
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
              </button>
            ))}
          </div>
          {type === "oem_premium_partners" && (
            <div className="space-y-2">
              <Label htmlFor="oemPartners">Partners</Label>
              <ValuesInput id="oemPartners" placeholder="Partner ID"
                onAdd={(v) => setValue("targeting.exchange.oemPremiumPartners", [...new Set([...partners, ...v])], dirty)} />
              <SelectedChips include={partners} empty="No partners yet"
                onRemove={(v) => setValue("targeting.exchange.oemPremiumPartners", partners.filter((x) => x !== v), dirty)} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------------ Tab */

const TargetingTab: React.FC<{ campaignId: string; campaignType: string }> = ({ campaignId, campaignType }) => {
  const [sub, setSub] = useState<SubTab>("geo");
  const { watch } = useFormContext<LineItemFormValues>();
  const { data: optResp } = useTargetingOptions();
  const options: TargetingOptions | undefined = optResp?.data;
  const active = activeSubTabs(watch("targeting"));

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
            {active.has(t.id) && <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-label="has rules" />}
          </button>
        ))}
      </div>
      {sub === "geo" && <GeoPanel />}
      {sub === "app" && <AppSitePanel options={options} />}
      {sub === "content" && <ContentPanel />}
      {sub === "environment" && <EnvironmentPanel campaignType={campaignType} />}
      {sub === "platform" && <PlatformPanel options={options} />}
      {sub === "time" && <TimePanel />}
      {sub === "segments" && <SegmentsPanel campaignId={campaignId} options={options} />}
      {sub === "exchange" && <ExchangePanel options={options} />}
    </div>
  );
};

export default TargetingTab;

import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Ban, CheckCircle2, Handshake, ListChecks, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SelectComponent from "@/components/inputComponents/select-component";
import SelectedChips from "@/components/targeting/selected-chips";
import ValuesInput from "@/components/targeting/values-input";
import { useInventoryApps, useInventoryFacets, useInventoryPartners } from "@/query/useInventory";
import type { InventoryApp, InventoryFacets, InventoryKind, InventoryPartners } from "@/services/inventory";
import type { LineItemFormValues } from "@/utils/schemas/lineItem";

const dirty = { shouldDirty: true };
const ALL = "__all__";

// 2033195000 → "2.03B", 335570000 → "335.6M".
const compact = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n);

const day = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

const useDebounced = (value: string, ms: number) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

// "RUBICON, INMOBI +9" on one line; the full list on hover.
const Few: React.FC<{ items: string[]; max?: number }> = ({ items, max = 2 }) => (
  <span className="text-xs text-muted-foreground whitespace-nowrap" title={items.join(", ")}>
    {items.slice(0, max).join(", ")}
    {items.length > max && <span className="ml-1 text-foreground/70">+{items.length - max}</span>}
  </span>
);

/* ------------------------------------------------------------ App inventory */

const AppInventory: React.FC = () => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const bundles = watch("targeting.inventory.bundles");
  const [country, setCountry] = useState("IN");
  const [kind, setKind] = useState<InventoryKind>("bundle");
  const [searchText, setSearchText] = useState("");
  const search = useDebounced(searchText.trim(), 350);
  const [exchange, setExchange] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [page, setPage] = useState(1);
  // Any filter change starts again from the first page.
  const fresh = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const { data: facetResp } = useInventoryFacets(country);
  const facets: InventoryFacets | undefined = facetResp?.data?.data;
  const { data: appResp, isFetching } = useInventoryApps({
    country,
    kind,
    search: search || undefined,
    exchange: exchange || undefined,
    deviceType: deviceType || undefined,
    page,
    limit: 25,
  });
  const apps: InventoryApp[] = appResp?.data?.data ?? [];
  const pagination = appResp?.data?.pagination;
  const loaded = facets?.loaded?.[kind];

  // Include / exclude writes the bundle into App/Site › App bundles; clicking
  // the same side again takes it off.
  const toggle = (key: string, side: "include" | "exclude") => {
    const other = side === "include" ? "exclude" : "include";
    const on = bundles[side].includes(key);
    setValue(
      "targeting.inventory.bundles",
      {
        ...bundles,
        [side]: on ? bundles[side].filter((b) => b !== key) : [...bundles[side], key],
        [other]: bundles[other].filter((b) => b !== key),
      },
      dirty,
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><ListChecks className="w-4 h-4 text-primary" /> App inventory</CardTitle>
        <CardDescription>
          Apps the exchanges send us, busiest first. Include or exclude an app here and it goes into App/Site › App
          bundles.
          {loaded && (
            <> Loaded {day(loaded.updatedAt)}{loaded.fileName ? ` from ${loaded.fileName}` : ""}: {loaded.apps.toLocaleString()} apps.</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1" role="tablist" aria-label="List by">
          {([
            { id: "bundle", label: "By bundle" },
            { id: "name", label: "By app name" },
          ] as const).map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={kind === t.id} onClick={() => fresh(setKind)(t.id)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                kind === t.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="inventory-search" className="pl-9" value={searchText} autoComplete="off"
            placeholder={kind === "bundle" ? "Search bundles, e.g. truecaller" : "Search app names, e.g. Pocket FM"}
            onChange={(e) => fresh(setSearchText)(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectComponent id="inventory-country" value={country}
            data={(facets?.countries?.length ? facets.countries : ["IN"]).map((c) => ({ name: c === "IN" ? "India (IN)" : c, value: c }))}
            onValueChange={fresh(setCountry)} />
          <SelectComponent id="inventory-exchange" value={exchange || ALL} search
            data={[{ name: "All exchanges", value: ALL }, ...(facets?.exchanges ?? []).map((x) => ({ name: x, value: x }))]}
            onValueChange={(v) => fresh(setExchange)(v === ALL ? "" : v)} />
          <SelectComponent id="inventory-device" value={deviceType || ALL}
            data={[{ name: "All devices", value: ALL }, ...(facets?.deviceTypes ?? []).map((x) => ({ name: x, value: x }))]}
            onValueChange={(v) => fresh(setDeviceType)(v === ALL ? "" : v)} />
        </div>

        {kind === "name" && (
          <p className="text-xs text-muted-foreground rounded-md border border-dashed border-border px-3 py-2">
            Names are for reference: targeting matches an app's bundle ID. Look the app up under "By bundle" to include or exclude it.
          </p>
        )}

        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-4">{kind === "bundle" ? "App bundle / domain" : "App / site name"}</TableHead>
                <TableHead>Exchanges</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                {kind === "bundle" && <TableHead className="text-right pr-4">Targeting</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={kind === "bundle" ? 4 : 3} className="text-center py-10 text-muted-foreground">
                    {isFetching
                      ? "Loading inventory…"
                      : loaded
                        ? "No app matches these filters."
                        : "No inventory loaded for this country yet. A super admin can upload a report under Super admin › Inventory."}
                  </TableCell>
                </TableRow>
              ) : (
                apps.map((a) => {
                  const inc = bundles.include.includes(a.key);
                  const exc = bundles.exclude.includes(a.key);
                  return (
                    <TableRow key={a.key}>
                      <TableCell className="pl-4 max-w-[260px]">
                        <div className={`truncate ${kind === "bundle" ? "font-mono text-xs" : "text-sm"}`} title={a.key}>{a.key}</div>
                        <div className="text-[11px] text-muted-foreground truncate" title={a.deviceTypes.join(", ")}>
                          {a.deviceTypes.join(" · ") || "Device not reported"}
                        </div>
                      </TableCell>
                      <TableCell><Few items={a.exchanges} /></TableCell>
                      <TableCell className="text-right tabular-nums text-sm" title={a.requests.toLocaleString()}>{compact(a.requests)}</TableCell>
                      {kind === "bundle" && (
                        <TableCell className="text-right pr-4 whitespace-nowrap">
                          <Button type="button" size="icon" variant={inc ? "default" : "outline"} aria-pressed={inc}
                            aria-label={`${inc ? "Stop including" : "Include"} ${a.key}`} title={inc ? "Included" : "Include"}
                            className="h-7 w-7" onClick={() => toggle(a.key, "include")}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>{" "}
                          <Button type="button" size="icon" variant={exc ? "destructive" : "outline"} aria-pressed={exc}
                            aria-label={`${exc ? "Stop excluding" : "Exclude"} ${a.key}`} title={exc ? "Excluded" : "Exclude"}
                            className="h-7 w-7" onClick={() => toggle(a.key, "exclude")}>
                            <Ban className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-muted-foreground">
          <span>
            {kind === "bundle"
              ? `Line item includes ${bundles.include.length} and excludes ${bundles.exclude.length} bundle${bundles.include.length + bundles.exclude.length === 1 ? "" : "s"}.`
              : `${(pagination?.total ?? 0).toLocaleString()} names`}
          </span>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="h-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="tabular-nums">Page {page} of {pagination.totalPages.toLocaleString()}</span>
              <Button type="button" variant="outline" size="sm" className="h-7" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/* ----------------------------------------------------- OEMs and premium DSPs */

const PremiumPartners: React.FC = () => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const partners: string[] = watch("targeting.exchange.oemPremiumPartners") || [];
  const { data } = useInventoryPartners();
  const list: InventoryPartners = data?.data?.data ?? { oems: [], dsps: [] };
  const known = new Set([...list.oems, ...list.dsps]);
  const other = partners.filter((p) => !known.has(p));

  // Any partner picked marks the line item as an OEM / premium partner buy.
  const save = (next: string[]) => {
    setValue("targeting.exchange.oemPremiumPartners", next, dirty);
    setValue("targeting.exchange.inventoryType", next.length ? "oem_premium_partners" : "programmatic", dirty);
  };
  const toggle = (p: string) => save(partners.includes(p) ? partners.filter((x) => x !== p) : [...partners, p]);

  const group = (title: string, items: string[]) => (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{title}</Label>
      <div className="flex flex-wrap gap-2">
        {items.map((p) => {
          const on = partners.includes(p);
          return (
            <button key={p} type="button" aria-pressed={on} onClick={() => toggle(p)}
              className={`text-sm rounded-full border px-3 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                on ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-muted"
              }`}>
              {on && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Handshake className="w-4 h-4 text-primary" /> OEM and premium partners</CardTitle>
        <CardDescription>
          The OEMs and high-end DSPs this line item is planned against. Saved on the line item for planning and
          insertion orders; it doesn't change how the engine bids.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {group("OEMs", list.oems)}
        {group("High-end DSPs", list.dsps)}
        <div className="space-y-2">
          <Label htmlFor="other-partner" className="text-xs uppercase tracking-wide text-muted-foreground">Other partner</Label>
          <ValuesInput id="other-partner" placeholder="Partner name" onAdd={(v) => save([...new Set([...partners, ...v])])} />
          {other.length > 0 && (
            <SelectedChips include={other} empty="" onRemove={(v) => save(partners.filter((x) => x !== v))} />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {partners.length ? `${partners.length} selected: ${partners.join(", ")}` : "None selected: an open programmatic buy."}
        </p>
      </CardContent>
    </Card>
  );
};

// Line item › Targeting › Inventory list.
const InventoryListPanel: React.FC = () => (
  <div className="space-y-5">
    <AppInventory />
    <PremiumPartners />
  </div>
);

export default InventoryListPanel;

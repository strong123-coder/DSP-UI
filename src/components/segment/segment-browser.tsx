import React, { useEffect, useState } from "react";
import { Ban, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SelectComponent from "@/components/inputComponents/select-component";
import { useSegmentFacets, useSegments } from "@/query/useSegment";
import type { Segment, SegmentFacets, SegmentSource, SegmentStatus } from "@/services/segment";
import { SEGMENT_STATUS_LABEL, reachText } from "@/utils/segment";

const ALL = "__all__";

const STATUS_CLASS: Record<SegmentStatus, string> = {
  live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  needs_data: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  not_offered: "border-border bg-muted text-muted-foreground",
};

const SegmentStatusPill: React.FC<{ status: SegmentStatus | null; title?: string | null }> = ({ status, title }) => (
  <span title={title || undefined}
    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${
      status ? STATUS_CLASS[status] : STATUS_CLASS.not_offered
    }`}>
    {status ? SEGMENT_STATUS_LABEL[status] : "Removed"}
  </span>
);

const useDebounced = (value: string, ms: number) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

type Value = { include: string[]; exclude: string[] };

// Browses the segment catalog (ours, or the IAB list exchanges send). With
// value / onChange it also includes or excludes segments; only live ones can
// be picked.
const SegmentBrowser: React.FC<{
  value?: Value;
  onChange?: (v: Value) => void;
  country?: string;
}> = ({ value, onChange, country = "IN" }) => {
  const [source, setSource] = useState<SegmentSource>("catalog");
  const [searchText, setSearchText] = useState("");
  const search = useDebounced(searchText.trim(), 350);
  const [category, setCategory] = useState("");
  // Pickers start on what can be targeted; the library shows everything.
  const [status, setStatus] = useState<SegmentStatus | "">(onChange ? "live" : "");
  const [page, setPage] = useState(1);
  const fresh = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  const { data: facetResp } = useSegmentFacets(country);
  const facets: SegmentFacets | undefined = facetResp?.data?.data;
  const summary = facets?.[source];
  const { data: listResp, isFetching } = useSegments({
    source,
    country,
    search: search || undefined,
    category: category || undefined,
    status: status || undefined,
    page,
    limit: 25,
  });
  const rows: Segment[] = listResp?.data?.data ?? [];
  const pagination = listResp?.data?.pagination;

  const toggle = (key: string, side: "include" | "exclude") => {
    if (!value || !onChange) return;
    const other = side === "include" ? "exclude" : "include";
    const on = value[side].includes(key);
    onChange({
      ...value,
      [side]: on ? value[side].filter((k) => k !== key) : [...value[side], key],
      [other]: value[other].filter((k) => k !== key),
    } as Value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 flex-wrap" role="tablist" aria-label="Segment source">
        {([
          { id: "catalog", label: "Our catalog", hint: facets ? `${facets.catalog.live} live of ${facets.catalog.total}` : "" },
          { id: "iab", label: "Exchange (IAB)", hint: facets ? `${facets.iab.live} live` : "" },
        ] as const).map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={source === t.id}
            onClick={() => {
              setSource(t.id);
              setCategory("");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
              source === t.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
            }`}>
            {t.label}
            {t.hint && <span className="ml-1.5 text-[11px] text-muted-foreground tabular-nums">{t.hint}</span>}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {source === "catalog"
          ? "Live segments are decided from the bid request itself (state, city, device language, OS, make, carrier, connection), so they need no stored user data. Reach is the workbook's estimate of monthly devices; segments overlap, so never add them up."
          : "IAB Audience Taxonomy 1.1 segments that exchanges send with the request (Seller Defined Audiences, segtax 4). The exchange decides who is in them; few requests carry them today. Picking a branch also matches the segments under it."}
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input id={`segment-search-${source}`} className="pl-9" value={searchText} autoComplete="off"
          placeholder={source === "catalog" ? "Search segments, e.g. Jio, Hindi, Pune" : "Search IAB segments, e.g. Automotive, Travel"}
          onChange={(e) => fresh(setSearchText)(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectComponent id="segment-category" value={category || ALL} search
          data={[
            { name: "All categories", value: ALL },
            ...(summary?.categories ?? []).map((c) => ({ name: `${c.name} (${c.live}/${c.total} live)`, value: c.name })),
          ]}
          onValueChange={(v) => fresh(setCategory)(v === ALL ? "" : v)} />
        <SelectComponent id="segment-status" value={status || ALL}
          data={[
            { name: "Any status", value: ALL },
            { name: "Live: can be targeted", value: "live" },
            { name: "Needs data", value: "needs_data" },
            { name: "Not offered", value: "not_offered" },
          ]}
          onValueChange={(v) => fresh(setStatus)(v === ALL ? "" : (v as SegmentStatus))} />
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="pl-4">Segment</TableHead>
              {source === "catalog" && <TableHead className="text-right">Est. reach</TableHead>}
              <TableHead>Status</TableHead>
              {onChange && <TableHead className="text-right pr-4">Targeting</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  {isFetching
                    ? "Loading segments…"
                    : summary && summary.total === 0
                      ? source === "catalog"
                        ? "No segment catalog loaded yet. A super admin can upload the workbook under Super admin › Segments."
                        : "The IAB list isn't loaded yet. It loads with the segment workbook."
                      : "No segment matches these filters."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((s) => {
                const inc = !!value?.include.includes(s.key);
                const exc = !!value?.exclude.includes(s.key);
                const live = s.status === "live";
                return (
                  <TableRow key={s.key}>
                    <TableCell className="pl-4 max-w-[420px]">
                      <div className="text-sm font-medium truncate" title={s.path || s.name}>{s.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate" title={s.path || undefined}>
                        {source === "iab" ? s.path : [s.category, s.subCategory].filter(Boolean).join(" › ")}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${live ? "text-muted-foreground" : "text-amber-700 dark:text-amber-300"}`}
                        title={live ? s.match || undefined : s.reason || undefined}>
                        {live ? s.match : s.reason}
                      </div>
                    </TableCell>
                    {source === "catalog" && (
                      <TableCell className="text-right tabular-nums text-sm whitespace-nowrap">
                        {reachText(s.reachMn)}
                        {s.scaleTier && <div className="text-[11px] text-muted-foreground">{s.scaleTier}</div>}
                      </TableCell>
                    )}
                    <TableCell><SegmentStatusPill status={s.status} /></TableCell>
                    {onChange && (
                      <TableCell className="text-right pr-4 whitespace-nowrap">
                        <Button type="button" size="icon" variant={inc ? "default" : "outline"} aria-pressed={inc}
                          disabled={!live && !inc} aria-label={`${inc ? "Stop including" : "Include"} ${s.name}`}
                          title={live ? (inc ? "Included" : "Include") : s.reason || "Can't be targeted yet"}
                          className="h-7 w-7" onClick={() => toggle(s.key, "include")}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </Button>{" "}
                        <Button type="button" size="icon" variant={exc ? "destructive" : "outline"} aria-pressed={exc}
                          disabled={!live && !exc} aria-label={`${exc ? "Stop excluding" : "Exclude"} ${s.name}`}
                          title={live ? (exc ? "Excluded" : "Exclude") : s.reason || "Can't be targeted yet"}
                          className="h-7 w-7" onClick={() => toggle(s.key, "exclude")}>
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
        <span className="tabular-nums">{(pagination?.total ?? 0).toLocaleString()} segments</span>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="h-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="tabular-nums">Page {page} of {pagination.totalPages.toLocaleString()}</span>
            <Button type="button" variant="outline" size="sm" className="h-7" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SegmentBrowser;

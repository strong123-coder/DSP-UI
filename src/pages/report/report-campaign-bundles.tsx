import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Boxes, Globe } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MetricValue } from "@/components/ui/metric-value";
import { DateRangePicker } from "src/components/ui/date-range-picker";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useGetCampaignBundles } from "@/query/useReport";
import ReportTableHeader from "./components/report-table-header";
import type { BundleRow, BundleTotals, CampaignBundlesResponse, SortDirection } from "./types";

// Column order: the core report metrics first, then the per-bundle extras.
const COLUMNS = [
  { key: "bundle", label: "BUNDLE ID", sortable: false },
  { key: "impressions", label: "IMPRESSIONS", sortable: true },
  { key: "clicks", label: "CLICKS", sortable: true },
  { key: "installs", label: "INSTALL", sortable: true },
  { key: "ctr", label: "CTR", sortable: true },
  { key: "cvr", label: "INSTALL RATE", sortable: true },
  { key: "spent", label: "SPENT", sortable: true },
  { key: "spendShare", label: "% OF SPEND", sortable: true },
  { key: "ecpm", label: "ECPM", sortable: true },
  { key: "cpi", label: "CPI", sortable: true },
  { key: "cpc", label: "CPC", sortable: true },
  { key: "countries", label: "COUNTRIES", sortable: true },
  { key: "placements", label: "PLACEMENTS", sortable: true },
  { key: "activeDays", label: "ACTIVE DAYS", sortable: true },
];

const COUNT_KEYS = new Set(["impressions", "clicks", "installs"]);
const MONEY_KEYS = new Set(["spent", "ecpm", "cpi", "cpc"]);
const PERCENT_KEYS = new Set(["ctr", "cvr"]);

const prettyDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    return format(new Date(d + "T00:00:00"), "LLL d");
  } catch {
    return d;
  }
};

const SummaryCard: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <Card className="p-4 gap-1">
    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-xl font-bold leading-tight">{children}</div>
    {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
  </Card>
);

const ReportCampaignBundles: React.FC = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // The date range arrives from the report row that was clicked, so this page
  // opens on the same period. With none set the API defaults to yesterday —
  // identical to the report list's default.
  const [startDate, setStartDate] = useState<string | undefined>(searchParams.get("startDate") || undefined);
  const [endDate, setEndDate] = useState<string | undefined>(searchParams.get("endDate") || undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchState, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ by: string; order: SortDirection }>({ by: "spent", order: "desc" });

  useEffect(() => {
    const h = setTimeout(() => {
      setDebouncedSearch(searchState.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(h);
  }, [searchState]);

  // Keep the range in the URL so the page survives a refresh / can be shared.
  useEffect(() => {
    const next = new URLSearchParams();
    if (startDate) next.set("startDate", startDate);
    if (endDate) next.set("endDate", endDate);
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [startDate, endDate, searchParams, setSearchParams]);

  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    } catch {
      return "Asia/Kolkata";
    }
  }, []);

  const payload = useMemo(
    () => ({
      campaignId: campaignId as string,
      search: debouncedSearch || undefined,
      // A half-picked range (start only) is not sent; the API needs both.
      startDate: startDate && endDate ? startDate : undefined,
      endDate: startDate && endDate ? endDate : undefined,
      timezone,
      sortBy: sortConfig.by,
      sortOrder: sortConfig.order,
      page,
      limit,
    }),
    [campaignId, debouncedSearch, startDate, endDate, timezone, sortConfig, page, limit],
  );

  const { data: response, isLoading, isError, error, isPlaceholderData } = useGetCampaignBundles(!!campaignId, payload);
  const report: CampaignBundlesResponse | undefined = response?.data;
  const rows: BundleRow[] = report?.data ?? [];
  const totals: BundleTotals | undefined = report?.totals;
  const tableTotals: BundleTotals | undefined = report?.tableTotals;
  const totalPages = report?.pagination?.totalPages || 1;
  const campaign = report?.campaign;

  const dateRangeValue = useMemo(() => {
    if (!startDate) return undefined;
    return {
      from: new Date(startDate + "T00:00:00"),
      to: endDate ? new Date(endDate + "T00:00:00") : undefined,
    };
  }, [startDate, endDate]);

  const handleDateRangeChange = (range: any) => {
    setStartDate(range?.from ? format(range.from, "yyyy-MM-dd") : undefined);
    setEndDate(range?.to ? format(range.to, "yyyy-MM-dd") : undefined);
    setPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => (prev.by === key ? { by: key, order: prev.order === "asc" ? "desc" : "asc" } : { by: key, order: "desc" }));
    setPage(1);
  };

  const backToReport = () => {
    const p = new URLSearchParams();
    if (startDate) p.set("startDate", startDate);
    if (endDate) p.set("endDate", endDate);
    const qs = p.toString();
    navigate(`/report${qs ? `?${qs}` : ""}`);
  };

  const renderMetric = (row: Record<string, any>, key: string) => {
    const val = row[key];
    if (COUNT_KEYS.has(key)) return <MetricValue value={val} />;
    if (PERCENT_KEYS.has(key)) return <MetricValue value={val} percent />;
    if (MONEY_KEYS.has(key)) return <MetricValue value={val} currency decimals={2} />;
    return val !== undefined && val !== null ? String(val) : "—";
  };

  const renderCell = (row: BundleRow, key: string) => {
    if (key === "bundle") {
      return row.bundle ? (
        <span className="font-medium" title={row.bundle}>{row.bundle}</span>
      ) : (
        <span className="text-muted-foreground italic">Unknown (no bundle sent)</span>
      );
    }
    if (key === "spendShare") {
      return (
        <div className="flex items-center gap-2 min-w-[110px]">
          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden shrink-0">
            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, row.spendShare)}%` }} />
          </div>
          <span className="tabular-nums">{row.spendShare.toFixed(2)}%</span>
        </div>
      );
    }
    if (key === "countries") {
      if (!row.countries) return "—";
      const more = row.countries - row.countryList.length;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 cursor-default"><Globe className="w-3 h-3 text-muted-foreground" />{row.countries}</span>
          </TooltipTrigger>
          <TooltipContent>{row.countryList.join(", ")}{more > 0 ? ` +${more} more` : ""}</TooltipContent>
        </Tooltip>
      );
    }
    if (key === "activeDays") {
      return (
        <Tooltip>
          <TooltipTrigger asChild><span className="cursor-default">{row.activeDays}</span></TooltipTrigger>
          <TooltipContent>{prettyDate(row.firstSeen)} → {prettyDate(row.lastSeen)}</TooltipContent>
        </Tooltip>
      );
    }
    if (key === "placements") return row.placements || "—";
    return renderMetric(row, key);
  };

  if (isLoading) return <LoadingFallback />;

  if (isError) {
    const msg = (error as any)?.response?.data?.message || (error as any)?.message || "Something went wrong";
    return (
      <div className="space-y-4">
        <Button variant="ghost" className="gap-1.5" onClick={backToReport}><ArrowLeft className="w-4 h-4" /> Back to report</Button>
        <div className="text-center text-destructive p-8 bg-destructive/10 rounded-2xl border border-destructive/20 max-w-2xl mx-auto font-sans">
          Couldn't load this campaign's bundle breakdown: {msg}
        </div>
      </div>
    );
  }

  const rangeLabel = report?.range ? `${prettyDate(report.range.startDate)} – ${prettyDate(report.range.endDate)}` : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={backToReport} title="Back to report" aria-label="Back to report">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {campaign?.appIconLink ? (
            <img src={campaign.appIconLink} alt="" className="w-11 h-11 rounded-xl border border-border/60 object-cover shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-xl border border-border/60 bg-muted flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold truncate">{campaign?.title || "Campaign"}</h1>
              {campaign?.status && (
                <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="uppercase text-[10px]">{campaign.status}</Badge>
              )}
              {campaign?.type && <Badge variant="outline" className="uppercase text-[10px]">{campaign.type}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {[campaign?.appName, campaign?.bundleId, campaign?.appOs].filter(Boolean).join(" · ") || campaign?.id}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Delivery grouped by bundle ID — the apps and sites this campaign's ads ran in · {rangeLabel}
            </p>
          </div>
        </div>
        <DateRangePicker value={dateRangeValue} onChange={handleDateRangeChange} />
      </div>

      {/* Campaign-wide summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <SummaryCard label="Bundles"><MetricValue value={report?.bundleCount ?? 0} /></SummaryCard>
        <SummaryCard label="Impressions"><MetricValue value={totals?.impressions} /></SummaryCard>
        <SummaryCard label="Clicks"><MetricValue value={totals?.clicks} /></SummaryCard>
        <SummaryCard label="Install"><MetricValue value={totals?.installs} /></SummaryCard>
        <SummaryCard label="CTR"><MetricValue value={totals?.ctr} percent /></SummaryCard>
        <SummaryCard label="Spent"><MetricValue value={totals?.spent} currency decimals={2} /></SummaryCard>
        <SummaryCard label="CPI"><MetricValue value={totals?.cpi} currency decimals={2} /></SummaryCard>
        <SummaryCard label="CPC"><MetricValue value={totals?.cpc} currency decimals={2} /></SummaryCard>
      </div>

      {/* Bundle search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="bundle-search"
            autoComplete="off"
            placeholder="Search bundle ID…"
            className="pl-9 pr-4 w-full"
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {debouncedSearch
            ? `${report?.pagination?.total ?? 0} of ${report?.bundleCount ?? 0} bundles match`
            : `${report?.bundleCount ?? 0} bundles`}
        </span>
      </div>

      {/* Bundle table */}
      <div className={`w-full border border-border/50 rounded-2xl shadow-xs bg-card overflow-hidden transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
        <div className="overflow-x-auto">
          <Table>
            <ReportTableHeader activeHeaders={COLUMNS} sortConfig={sortConfig} onSort={handleSort} />
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} className="text-center py-12 text-sm text-muted-foreground">
                    {debouncedSearch
                      ? `No bundle matches "${debouncedSearch}".`
                      : "This campaign has no delivery in the selected period. Try a wider date range."}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => (
                  <TableRow key={row.bundle || `unknown-${i}`} className="hover:bg-muted/20">
                    {COLUMNS.map((col) => (
                      <TableCell key={col.key} className={`py-3.5 px-4 text-sm ${col.key === "bundle" ? "max-w-[260px] truncate" : "whitespace-nowrap"}`}>
                        {renderCell(row, col.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}

              {tableTotals && rows.length > 0 && (
                <TableRow className="bg-muted/10 font-bold border-t-2 border-border/60 hover:bg-muted/10">
                  {COLUMNS.map((col, idx) => (
                    <TableCell key={col.key} className="py-3.5 px-4 text-sm text-foreground font-bold whitespace-nowrap">
                      {idx === 0
                        ? debouncedSearch ? "TOTAL (MATCHING):" : "TOTAL:"
                        : col.key === "spendShare"
                        ? totals && totals.spent > 0 ? `${((tableTotals.spent / totals.spent) * 100).toFixed(2)}%` : "—"
                        : ["countries", "placements", "activeDays"].includes(col.key)
                        ? "—"
                        : renderMetric(tableTotals as Record<string, any>, col.key)}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {rows.length > 0 && (
        <ThreeButtonPagination page={page} setPage={setPage} totalPages={totalPages} limit={limit} setLimit={setLimit} />
      )}
    </div>
  );
};

export default ReportCampaignBundles;

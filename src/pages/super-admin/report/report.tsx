import React, { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import LoadingFallback from "@/components/ui/loading-fallback";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import ReportTableHeader from "@/pages/report/components/report-table-header";
import ReportTableBody from "@/pages/report/components/report-table-body";
import { MetricValue } from "@/components/ui/metric-value";
import { useSuperAdminReport, useSuperAdminOrgs } from "@/query/useSuperAdmin";
import type { ReportDataRow, ReportTotals, SortDirection } from "@/pages/report/types";

// Cross-org report dimensions (mirror backend SUPER_DIMENSION).
const DIMENSIONS: Array<{ value: string; label: string }> = [
  { value: "org", label: "Organization" },
  { value: "campaign", label: "Campaign" },
  { value: "bundle", label: "Bundle / App" },
  { value: "publisher", label: "Placement" },
  { value: "country", label: "Country" },
  { value: "date", label: "Date" },
  { value: "month", label: "Month" },
];
const DIMENSION_LABEL: Record<string, string> = Object.fromEntries(
  DIMENSIONS.map((d) => [d.value, d.label.toUpperCase()]),
);

const METRIC_COLS = [
  { key: "impressions", label: "IMPRESSIONS" },
  { key: "clicks", label: "CLICKS" },
  { key: "installs", label: "INSTALL" },
  { key: "events", label: "EVENTS" },
  { key: "ctr", label: "CTR" },
  { key: "spent", label: "SPENT" },
  { key: "cpi", label: "CPI" },
  { key: "cpc", label: "CPC" },
];
const REQUEST_COLUMNS = METRIC_COLS.map((m) => m.key);

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "last_7_days" },
  { label: "Last 30 days", value: "last_30_days" },
  { label: "This month", value: "this_month" },
  { label: "Last month", value: "last_month" },
];

const SuperAdminReport: React.FC = () => {
  const [groupBy, setGroupBy] = useState<string[]>(["org"]);
  const [preset, setPreset] = useState("last_30_days");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ by: string; order: SortDirection }>({
    by: "spent",
    order: "desc",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  // Org filter dropdown source.
  const { data: orgsResp } = useSuperAdminOrgs({ preset });
  const orgOptions: Array<{ orgId: string; name: string }> = orgsResp?.data?.data ?? [];

  const toggleDimension = (value: string) => {
    setGroupBy((prev) => {
      if (prev.includes(value)) {
        // keep at least one dimension selected
        return prev.length > 1 ? prev.filter((d) => d !== value) : prev;
      }
      return [...prev, value];
    });
    setPage(1);
  };

  const payload = useMemo(
    () => ({
      groupBy,
      columns: REQUEST_COLUMNS,
      orgId: orgFilter !== "all" ? orgFilter : undefined,
      search: debouncedSearch || undefined,
      preset,
      sortBy: sortConfig.by,
      sortOrder: sortConfig.order,
      page,
      limit,
    }),
    [groupBy, orgFilter, debouncedSearch, preset, sortConfig, page, limit],
  );

  const { data: resp, isLoading, isError, error } = useSuperAdminReport(true, payload);

  const result = resp?.data;
  const rows: ReportDataRow[] = (result?.data as ReportDataRow[]) ?? [];
  const totals: ReportTotals | null = result?.totals ?? null;
  const pagination = result?.pagination;
  const totalPages = pagination ? pagination.totalPages || 1 : 1;

  // Header columns: one per selected dimension, then the metric columns.
  const activeHeaders = useMemo(() => {
    const dimHeaders = groupBy.map((d) => ({
      key: d,
      label: DIMENSION_LABEL[d] || d.toUpperCase(),
      sortable: false,
    }));
    const metricHeaders = METRIC_COLS.map((m) => ({
      key: m.key,
      label: m.label,
      sortable: true,
    }));
    return [...dimHeaders, ...metricHeaders];
  }, [groupBy]);

  const handleSort = (key: string) => {
    setSortConfig((prev) =>
      prev.by === key
        ? { by: key, order: prev.order === "asc" ? "desc" : "asc" }
        : { by: key, order: "desc" },
    );
    setPage(1);
  };

  const renderCell = (row: ReportDataRow, key: string): React.ReactNode => {
    switch (key) {
      case "org":
        return (
          <span className="font-medium">{row.orgName || row.org || "—"}</span>
        );
      case "campaign":
        return <span className="font-medium">{row.campaignTitle || row.campaign || "—"}</span>;
      case "bundle":
        return (
          <span className="font-mono text-xs">{row.bundle || "(unknown)"}</span>
        );
      case "publisher":
        return row.publisher || "—";
      case "country":
        return row.country || "—";
      case "date":
        return row.date || "—";
      case "month":
        return row.month || "—";
      case "ctr":
        return <MetricValue value={row.ctr} percent />;
      case "spent":
      case "cpi":
      case "cpc":
        return <MetricValue value={row[key]} currency decimals={2} />;
      default:
        // impressions / clicks / installs / events
        return <MetricValue value={row[key]} />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Aggregate Report</h1>
          <p className="text-sm text-muted-foreground">
            Cross-org performance — group by organization, campaign, bundle (app/site) and more.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Group By multi-select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Group by
              <span className="text-xs text-muted-foreground">({groupBy.length})</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 bg-card border border-border">
            <DropdownMenuLabel>Dimensions</DropdownMenuLabel>
            {DIMENSIONS.map((d) => (
              <DropdownMenuCheckboxItem
                key={d.value}
                checked={groupBy.includes(d.value)}
                onCheckedChange={() => toggleDimension(d.value)}
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer"
              >
                {d.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Org filter */}
        <Select
          value={orgFilter}
          onValueChange={(v) => {
            setOrgFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px] h-9 bg-card">
            <SelectValue placeholder="All organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All organizations</SelectItem>
            {orgOptions.map((o) => (
              <SelectItem key={o.orgId} value={o.orgId}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date preset */}
        <Select
          value={preset}
          onValueChange={(v) => {
            setPreset(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] h-9 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bundle / campaign / country…"
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {isError ? (
        <div className="text-center text-destructive p-8 bg-destructive/10 rounded-2xl border border-destructive/20">
          Error loading report: {(error as Error)?.message || "Something went wrong"}
        </div>
      ) : isLoading && rows.length === 0 ? (
        <LoadingFallback />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <ReportTableHeader
                activeHeaders={activeHeaders}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <ReportTableBody
                reportData={rows}
                activeHeaders={activeHeaders}
                totals={totals}
                renderCell={renderCell}
              />
            </Table>
          </div>
        </Card>
      )}

      {rows.length > 0 && (
        <ThreeButtonPagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          limit={limit}
          setLimit={setLimit}
        />
      )}
    </div>
  );
};

export default SuperAdminReport;

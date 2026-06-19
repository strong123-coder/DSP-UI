import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";
import { useGetReportData, useGetReportPrefetch } from "@/query/useReport";
import { Table } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import ReportFilter from "./report-filter";
import ReportTableHeader from "./report-table-header";
import ReportTableBody from "./report-table-body";
import { MetricValue } from "@/components/ui/metric-value";
import type { ReportDataRow, SortDirection } from "../types";

import { allColHeaders } from "../constants";

const ReportListTable: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchState, setSearchState] = useState("");

  // Active columns selected via Checkbox Group
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "impressions",
    "clicks",
    "installs",
    "ctr",
    "spent",
    "cpi",
    "cpc",
  ]);

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key)
        ? prev.filter((col) => col !== key)
        : [...prev, key]
    );
  };

  // Sorting states
  const [sortConfig, setSortConfig] = useState<{
    by: string;
    order: SortDirection;
  }>({ by: "spent", order: "desc" });

  // Filters state (Campaign, Group By)
  const [filters, setFilters] = useState<{
    campaignIds?: string[];
    groupBy?: string[];
  }>({
    groupBy: ["campaign"],
  });


  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchState.trim());
      setPage(1);
    }, 600);
    return () => clearTimeout(handler);
  }, [searchState]);



  // Client timezone
  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    } catch {
      return "Asia/Kolkata";
    }
  }, []);

  // Compute active headers list based on selected column
  const activeHeaders = useMemo(() => {
    return allColHeaders.filter((col) => {
      if (col.isAlwaysVisible) return true;
      return selectedColumns.includes(col.key);
    });
  }, [selectedColumns]);

  // Assemble full payload for the API
  const apiPayload = useMemo(() => {
    // Keep standard metric columns request structure while showing only selected radio item visually
    const columns = ["impressions", "clicks", "installs", "events", "ctr", "spent", "cpi", "cpc"];

    return {
      groupBy: filters.groupBy || ["campaign"],
      columns,
      campaignIds: filters.campaignIds,
      search: debouncedSearch || undefined,
      timezone,
      sortBy: sortConfig.by,
      sortOrder: sortConfig.order,
      page,
      limit,
    };
  }, [filters, debouncedSearch, timezone, sortConfig, page, limit]);

  const navigate = useNavigate();

  // --- Parse URL params on mount ---
  useEffect(() => {
    if (!initialized) {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get("page");
      const limitParam = params.get("limit");
      const searchParam = params.get("search");
      const campaignIdsParam = params.get("campaignIds");
      const groupByParam = params.get("groupBy");

      const pageLocal = Math.max(1, parseInt(pageParam || "1", 10));
      const limitLocal = Math.min(
        Math.max(1, parseInt(limitParam || "10", 10)),
        200,
      );

      setPage(pageLocal);
      setLimit(limitLocal);

      if (searchParam?.trim()) {
        setSearchState(searchParam.trim());
      }

      const nextFilters: typeof filters = {
        groupBy: ["campaign"],
      };

      if (campaignIdsParam?.trim()) {
        nextFilters.campaignIds = campaignIdsParam.split(",").filter(Boolean);
      }

      if (groupByParam?.trim()) {
        nextFilters.groupBy = groupByParam.split(",").filter(Boolean);
      }

      setFilters(nextFilters);
      setInitialized(true);
    }
  }, [initialized]);

  // --- Sync URL params when state changes ---
  useEffect(() => {
    if (!initialized) return;

    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    if (searchState.trim()) {
      params.set("search", searchState.trim());
    }

    if (filters.campaignIds && filters.campaignIds.length > 0) {
      params.set("campaignIds", filters.campaignIds.join(","));
    }

    if (filters.groupBy && filters.groupBy.length > 0) {
      params.set("groupBy", filters.groupBy.join(","));
    }

    const newQuery = params.toString();
    const currentQuery = window.location.search.slice(1);
    if (newQuery !== currentQuery) {
      navigate(`${window.location.pathname}?${newQuery}`, { replace: true });
    }
  }, [page, limit, searchState, filters, initialized, navigate]);

  // API Data fetching
  const { data: response, isLoading, isError, error, isPlaceholderData } = useGetReportData(
    initialized,
    apiPayload
  );

  // Pagination prefetching
  useGetReportPrefetch(
    isPlaceholderData,
    totalPages,
    page,
    limit,
    apiPayload
  );

  // Sync server totals and pagination metadata
  const reportData = useMemo(() => {
    if (response?.data) {
      const serverLimit = response.data.pagination?.limit || limit;
      const serverTotal = response.data.pagination?.total || 0;
      setTotalPages(Math.ceil(serverTotal / serverLimit) || 1);
      return (response.data.data as ReportDataRow[]) || [];
    }
    return [] as ReportDataRow[];
  }, [response, limit]);

  const totals = useMemo(() => {
    return response?.data?.totals || null;
  }, [response]);

  // Sorting handler
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.by === key) {
        return {
          by: key,
          order: prev.order === "asc" ? "desc" : "asc",
        };
      }
      return {
        by: key,
        order: "desc",
      };
    });
    setPage(1);
  };

  const renderCell = (row: ReportDataRow, key: string) => {
    const val = row[key];
    if (key === "campaignTitle") {
      const campId = row.campaign ? row.campaign.replace(/\.\.\./g, "") : "";
      const displayTitle = row.campaignTitle || "Unknown Campaign";
      return (
        <span className="text-primary font-medium hover:underline hover:cursor-pointer transition-all">
          {campId ? `${campId} - ${displayTitle}` : displayTitle}
        </span>
      );
    }
    if (key === "advertiser") {
      return row.advertiser || row.advertiserName || row.advertiserTitle || "-";
    }
    // Counts: abbreviated (1.2M / 3.4K) with the exact figure on hover.
    if (key === "impressions" || key === "clicks" || key === "installs" || key === "events") {
      return <MetricValue value={val} />;
    }
    if (key === "ctr") return <MetricValue value={val} percent />;
    // Money: spent always present; cpi/cpc may be null -> rendered as "—".
    if (key === "spent" || key === "cpi" || key === "cpc") {
      return <MetricValue value={val} currency decimals={2} />;
    }
    return val !== undefined && val !== null ? String(val) : "-";
  };

  if (!initialized || isLoading) {
    return <LoadingFallback />;
  }

  if (isError) {
    return (
      <div className="text-center text-destructive p-8 bg-destructive/10 rounded-2xl border border-destructive/20 max-w-2xl mx-auto my-8 font-sans">
        Error loading report statistics: {error?.message || "Something went wrong"}
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Search and Columns Selector Toolbar */}
      <div className="relative w-full flex justify-center items-center">
        {/* Columns Selector Dropdown (Checkbox behavior) on the left */}
        <div className="absolute left-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="border-blue-600 text-blue-600 bg-blue-50/70 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:border-blue-400 dark:text-blue-400 h-9 w-9 shrink-0 cursor-pointer rounded-lg flex items-center justify-center transition-colors shadow-sm"
                title="Columns view"
              >
                <BookOpen className="w-4.5 h-4.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-card border border-border">
              {[
                { key: "advertiser", label: "Advertiser" },
                { key: "impressions", label: "Impressions" },
                { key: "clicks", label: "Clicks" },
                { key: "installs", label: "Install" },
                { key: "events", label: "Events" },
                { key: "ctr", label: "CTR" },
                { key: "spent", label: "Spent" },
                { key: "cpi", label: "CPI" },
                { key: "cpc", label: "CPC" },
              ].map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.key}
                  checked={selectedColumns.includes(c.key)}
                  onCheckedChange={() => toggleColumn(c.key)}
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer"
                >
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Centered Search box */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="report-search"
            autoComplete="off"
            type="text"
            placeholder="Search reports..."
            className="pl-9 pr-4"
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full border border-border/50 rounded-2xl shadow-xs bg-card overflow-hidden">
        <Table>
          <ReportTableHeader
            activeHeaders={activeHeaders}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          <ReportTableBody
            reportData={reportData}
            activeHeaders={activeHeaders}
            totals={totals}
            renderCell={renderCell}
          />
        </Table>
      </div>

      {/* Pagination Toolbar */}
      {reportData.length > 0 && (
        <ThreeButtonPagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          limit={limit}
          setLimit={setLimit}
        />
      )}

      {/* Filter Drawer Sidebar */}
      <ReportFilter
        filterData={filters}
        setFilterData={setFilters}
        setPage={setPage}
      />
    </div>
  );
};

export default ReportListTable;

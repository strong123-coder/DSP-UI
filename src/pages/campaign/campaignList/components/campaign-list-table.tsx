import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useGetCampaign, useGetCampaignPrefetch } from "@/query/useCampaign";
import { Table } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import CampaignFilter from "./campaign-filter";
import CampaignTableHeader from "./campaign-table-header";
import CampaignTableBody, {
  StatusBadge,
  TypeBadge,
} from "./campaign-table-body";
import CampaignDetailsModal from "./campaign-details-modal";
import type { Campaign, SortDirection } from "../../types";

const sortableKeys = new Set<string>([
  "title",
  "type",
  "goal",
  "dailyBudget",
  "budget",
  "status",
  "createdAt",
]);

const CampaignListTable: React.FC = () => {
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchState, setSearchState] = useState("");
  const [filters, setFilters] = useState<{
    search?: string;
    type?: string;
    status?: string;
  }>({});
  const [dataMapping, setDataMapping] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(null);
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);

  // --- Debounced search ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (initialized) {
        setPage(1);
        setFilters((prev) => {
          const updated = { ...prev };
          if (searchState.trim() !== "") {
            updated.search = searchState.trim();
          } else {
            delete updated.search;
          }
          return updated;
        });
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchState, initialized]);

  // --- Parse URL params on mount ---
  useEffect(() => {
    if (!initialized) {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get("page");
      const limitParam = params.get("limit");
      const searchParam = params.get("search");
      const typeParam = params.get("type");
      const statusParam = params.get("status");

      const pageLocal = Math.max(1, parseInt(pageParam || "1", 10));
      const limitLocal = Math.min(
        Math.max(1, parseInt(limitParam || "10", 10)),
        100,
      );

      setPage(pageLocal);
      setLimit(limitLocal);

      const nextFilters: typeof filters = {};
      if (searchParam?.trim()) {
        setSearchState(searchParam.trim());
        nextFilters.search = searchParam.trim();
      }
      if (typeParam?.trim()) nextFilters.type = typeParam.trim();
      if (statusParam?.trim()) nextFilters.status = statusParam.trim();

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
    if (filters.search) params.set("search", filters.search);
    if (filters.type) params.set("type", filters.type);
    if (filters.status) params.set("status", filters.status);

    const newQuery = params.toString();
    const currentQuery = window.location.search.slice(1);
    if (newQuery !== currentQuery) {
      navigate(`${window.location.pathname}?${newQuery}`, { replace: true });
    }
  }, [page, limit, filters, initialized, navigate]);

  // --- Data fetching ---
  const { data, isLoading, isError, error, isPlaceholderData } = useGetCampaign(
    initialized,
    { page, limit, ...filters },
  );

  useGetCampaignPrefetch(
    isPlaceholderData,
    totalPages,
    page,
    limit,
    filters.search,
    filters.type,
    filters.status,
  );

  const campaignsList = useMemo(() => {
    if (data?.data) {
      const serverLimit = data.data.pagination?.limit || limit;
      const serverTotal = data.data.pagination?.total || 0;
      setTotalPages(Math.ceil(serverTotal / serverLimit) || 1);
      if (data.data.dataMapping) setDataMapping(data.data.dataMapping);
      return (data.data.data as Campaign[]) || [];
    }
    return [] as Campaign[];
  }, [data, limit]);

  // --- Sorting ---
  const handleSort = (key: string) => {
    if (!sortableKeys.has(key)) return;
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedCampaigns = useMemo(() => {
    if (!sortConfig) return campaignsList;
    const key = sortConfig.key as keyof Campaign;
    const direction = sortConfig.direction;

    return [...campaignsList].sort((a, b) => {
      let valA: any = a[key];
      let valB: any = b[key];

      if (key === "budget" || key === "dailyBudget") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (key === "createdAt") {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      } else {
        valA = String(valA || "").toLowerCase();
        valB = String(valB || "").toLowerCase();
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [campaignsList, sortConfig]);

  // --- Cell renderer ---
  const getDisplayValue = useCallback(
    (campaign: Campaign, key: string): React.ReactNode => {
      const value = campaign[key as keyof Campaign];

      if (key === "status") return <StatusBadge status={String(value || "")} />;
      if (key === "type") return <TypeBadge type={String(value || "")} />;

      if (key === "budget" || key === "dailyBudget") {
        return `$${Number(value || 0).toLocaleString()} ${campaign.currency || "USD"}`;
      }

      if (key === "createdAt") {
        try {
          return new Date(String(value)).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        } catch {
          return String(value || "");
        }
      }

      return value === undefined || value === null ? "-" : String(value);
    },
    [],
  );

  // --- Loading / Error states ---
  if (!initialized || isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-destructive p-8 bg-destructive/10 rounded-2xl border border-destructive/20 max-w-2xl mx-auto my-8">
        Error loading campaigns: {error?.message || "Something went wrong"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="w-full flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            autoComplete="off"
            type="text"
            placeholder="Search campaigns..."
            className="pl-9 pr-4"
            onChange={(e) => setSearchState(e.target.value)}
            value={searchState}
          />
        </div>
      </div>

      {/* Table */}
      <div className="w-full border border-border/50 rounded-2xl shadow-xs bg-card overflow-hidden">
        <Table>
          <CampaignTableHeader
            dataMapping={dataMapping}
            sortConfig={sortConfig}
            sortableKeys={sortableKeys}
            onSort={handleSort}
          />
          <CampaignTableBody
            campaigns={sortedCampaigns}
            dataMapping={dataMapping}
            onViewCampaign={setViewCampaign}
            getDisplayValue={getDisplayValue}
          />
        </Table>
      </div>

      {/* Pagination */}
      {sortedCampaigns.length > 0 && (
        <ThreeButtonPagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          limit={limit}
          setLimit={setLimit}
        />
      )}

      {/* Filter Drawer */}
      <CampaignFilter
        filterData={filters}
        setFilterData={setFilters}
        setPage={setPage}
      />

      {/* Details Modal */}
      <CampaignDetailsModal
        campaign={viewCampaign}
        onClose={() => setViewCampaign(null)}
      />
    </div>
  );
};

export default CampaignListTable;

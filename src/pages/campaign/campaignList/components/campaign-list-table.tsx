import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  useGetCampaign,
  useGetCampaignPrefetch,
  useUpdateCampaignStatus,
} from "@/query/useCampaign";
import { Table } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import CampaignFilter from "./campaign-filter";
import CampaignTableHeader from "./campaign-table-header";
import CampaignTableBody, {
  StatusBadge,
  TypeBadge,
} from "./campaign-table-body";
import CampaignDetailsModal from "./campaign-details-modal";
import type { Campaign, SortDirection } from "../../types";
import LoadingFallback from "@/components/ui/loading-fallback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UpdatePopupModal from "@/components/popupModals/update-popup-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { geoData } from "@/utils/data/data";

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
  const [statusChangeRequest, setStatusChangeRequest] = useState<{
    campaign: Campaign;
    targetStatus: "active" | "paused";
  } | null>(null);

  const { mutate: updateCampaignStatus, isPending: isUpdatingStatus } =
    useUpdateCampaignStatus();

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

      if (key === "title") {
        return (
          <div className="flex items-center gap-3">
            {campaign?.appIconLink ? (
              <img
                src={campaign?.appIconLink}
                alt={campaign?.appName || String(value)}
                className="w-8 h-8 rounded-md object-cover border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border border-border">
                <span className="text-xs font-semibold text-muted-foreground">
                  {String(value).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-medium text-foreground">{String(value)}</span>
          </div>
        );
      }

      if (key === "status") {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none select-none">
                <StatusBadge status={String(value || "")} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  disabled={value === "active"}
                  onClick={() =>
                    setStatusChangeRequest({
                      campaign,
                      targetStatus: "active",
                    })
                  }
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={value === "paused"}
                  onClick={() =>
                    setStatusChangeRequest({
                      campaign,
                      targetStatus: "paused",
                    })
                  }
                >
                  Paused
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
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

      if (key === "geo") {
        if (!value) return "-";

        const getGeoName = (code: string) => {
          const matched = geoData.find(
            (g) => g.value.toUpperCase() === code.trim().toUpperCase()
          );
          return matched ? matched.name : code;
        };

        const geoArray = value as string[];
        const displayCodes = geoArray.join(", ");
        const fullNames = geoArray.map(getGeoName).join(", ");

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  {displayCodes}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{fullNames}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      }

      return value === undefined || value === null ? "-" : String(value);
    },
    [],
  );

  // --- Loading / Error states ---
  if (!initialized || isLoading) {
    return <LoadingFallback />;
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

      {/* Status Confirmation Modal */}
      <UpdatePopupModal
        isOpen={!!statusChangeRequest}
        title={<strong>Change Campaign Status</strong>}
        description={
          <span>
            Are you sure you want to change the status of campaign{" "}
            <strong>{statusChangeRequest?.campaign?.title}</strong> to{" "}
            <span className="font-semibold text-foreground capitalize">
              {statusChangeRequest?.targetStatus}
            </span>
            ?
          </span>
        }
        cancelButtonAction={() => setStatusChangeRequest(null)}
        updateButtonAction={() => {
          if (statusChangeRequest) {
            updateCampaignStatus(
              {
                id: statusChangeRequest.campaign._id,
                status: statusChangeRequest.targetStatus,
              },
              {
                onSuccess: () => {
                  setStatusChangeRequest(null);
                },
              },
            );
          }
        }}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
};

export default CampaignListTable;

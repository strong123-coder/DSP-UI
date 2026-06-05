import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  useGetUser,
  useGetUserPrefetch,
} from "@/query/useUserManagement";
import { Table } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import UserFilter from "./users-filter";
import UserTableHeader from "./users-table-header";
import UserTableBody, {
  UserStatusBadge,
  UserTypeBadge,
} from "./users-table-body";
import type { User, SortDirection } from "../../types";
import LoadingFallback from "@/components/ui/loading-fallback";
import UserDetailsModal from "./user-details-modal";

const sortableKeys = new Set<string>([
  "name",
  "email",
  "mobile",
  "type",
  "createdAt",
]);

const defaultDataMapping = {
  name: "Name",
  email: "Email",
  // secondaryEmails: "Secondary Emails",
  mobile: "Mobile",
  gender: "Gender",
  age: "Age",
  address: "Address",
  status: "Status",
  createdAt: "Created At",
  updatedAt: "Updated At",
};


const UsersListTable: React.FC = () => {
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
  const [dataMapping, setDataMapping] = useState<Record<string, string>>(defaultDataMapping);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const handleViewUser = useCallback((user: User) => {
    setViewUser(user);
    window.history.pushState({ userDetailModalOpen: true }, "", window.location.href);
  }, []);

  const handleCloseModal = useCallback(() => {
    setViewUser(null);
    if (window.history.state?.userDetailModalOpen) {
      window.history.back();
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (viewUser) {
        setViewUser(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [viewUser]);

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
  const { data, isLoading, isError, error, isPlaceholderData } = useGetUser(
    initialized,
    { page, limit, ...filters },
  );

  useGetUserPrefetch(
    isPlaceholderData,
    totalPages,
    page,
    limit,
    filters.search,
    filters.type,
    filters.status,
  );

  const usersList = useMemo(() => {
    if (data?.data) {
      const serverLimit = data.data.pagination?.limit || limit;
      const serverTotal = data.data.pagination?.total || 0;
      setTotalPages(Math.ceil(serverTotal / serverLimit) || 1);
      if (data.data.dataMapping) {
        setDataMapping(data.data.dataMapping);
      } else {
        setDataMapping(defaultDataMapping);
      }
      return (data.data.data as User[]) || [];
    }
    return [] as User[];
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

  const sortedUsers = useMemo(() => {
    if (!sortConfig) return usersList;
    const key = sortConfig.key as keyof User;
    const direction = sortConfig.direction;

    return [...usersList].sort((a, b) => {
      let valA: any = a[key];
      let valB: any = b[key];

      if (key === "createdAt") {
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
  }, [usersList, sortConfig]);

  // --- Cell renderer ---
  const getDisplayValue = useCallback(
    (user: User, key: string): React.ReactNode => {
      const value = user[key as keyof User];

      if (key === "status") {
        return <UserStatusBadge status={String(value || "active")} />;
      }
      if (key === "type") return <UserTypeBadge type={String(value || "")} />;

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

      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "-";
      }

      return value === undefined || value === null || value === "" ? "-" : String(value);
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
        Error loading users: {error?.message || "Something went wrong"}
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
            placeholder="Search users..."
            className="pl-9 pr-4"
            onChange={(e) => setSearchState(e.target.value)}
            value={searchState}
          />
        </div>
      </div>

      {/* Table */}
      <div className="w-full border border-border/50 rounded-2xl shadow-xs bg-card overflow-hidden">
        <Table>
          <UserTableHeader
            dataMapping={dataMapping}
            sortConfig={sortConfig}
            sortableKeys={sortableKeys}
            onSort={handleSort}
          />
          <UserTableBody
            users={sortedUsers}
            dataMapping={dataMapping}
            getDisplayValue={getDisplayValue}
            onViewUser={handleViewUser}
          />
        </Table>
      </div>

      {/* Pagination */}
      {sortedUsers.length > 0 && (
        <ThreeButtonPagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          limit={limit}
          setLimit={setLimit}
        />
      )}

      {/* Filter Drawer */}
      <UserFilter
        filterData={filters}
        setFilterData={setFilters}
        setPage={setPage}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        user={viewUser}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default UsersListTable;

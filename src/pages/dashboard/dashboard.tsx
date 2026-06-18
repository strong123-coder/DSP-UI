import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Wallet,
  Download,
  Layers,
  Magnet,
  Send,
} from "lucide-react";
import { useGetDashboardSummary, useGetDashboardPerformance, useGetDashboardGoalReport, useGetDashboardTopCampaigns } from "@/query/useDashboard";
import { useGetCampaignOptions } from "@/query/useCampaign";
import LoadingFallback from "@/components/ui/loading-fallback";

// Import modular sub-components
import { StatCard } from "./components/StatCard";
import { PerformanceChart } from "./components/PerformanceChart";
import { GoalReportChart } from "./components/GoalReportChart";
import { CampaignsTable } from "./components/CampaignsTable";

// Helper to format currency/numbers
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const formatNumber = (val: number) => {
  return new Intl.NumberFormat("en-US").format(val);
};

// Helper to calculate start/end dates based on preset selection
const getDatesForPreset = (preset: string) => {
  const end = new Date();
  const start = new Date();

  if (preset === "today") {
    // start and end are both today
  } else if (preset === "yesterday") {
    start.setDate(end.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (preset === "7days" || preset === "last_7_days") {
    start.setDate(end.getDate() - 7);
  } else if (preset === "30days" || preset === "last_30_days") {
    start.setDate(end.getDate() - 30);
  } else if (preset === "90days" || preset === "last_90_days") {
    start.setDate(end.getDate() - 90);
  }

  const formatDate = (d: Date) => d.toISOString().split("T")[0];
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
};

// Helper to calculate start/end dates based on preset selection

export default function Dashboard() {
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");
  const [performanceMetric, setPerformanceMetric] = useState<"install" | "spent" | "clicks" | "events" | "impression" | "re-engagement">("install");
  const [dateRange, setDateRange] = useState<string>("7days");
  const [topCampaignsSortBy, setTopCampaignsSortBy] = useState<string>("spent");
  const [topCampaignsLimit, setTopCampaignsLimit] = useState<number>(10);

  // --- Parse URL params on mount ---
  useEffect(() => {
    if (!initialized) {
      const params = new URLSearchParams(window.location.search);
      const campaignParam = params.get("campaignId");
      const dateRangeParam = params.get("dateRange");
      const metricParam = params.get("metric");
      const sortByParam = params.get("topCampaignsSortBy");
      const limitParam = params.get("topCampaignsLimit");

      if (campaignParam?.trim()) {
        setSelectedCampaignId(campaignParam.trim());
      }
      if (dateRangeParam?.trim()) {
        setDateRange(dateRangeParam.trim());
      }
      if (metricParam?.trim()) {
        setPerformanceMetric(metricParam.trim() as any);
      }
      if (sortByParam?.trim()) {
        setTopCampaignsSortBy(sortByParam.trim());
      }
      if (limitParam?.trim()) {
        setTopCampaignsLimit(Number(limitParam.trim()) || 10);
      }
      setInitialized(true);
    }
  }, [initialized]);

  // --- Sync URL params when state changes ---
  useEffect(() => {
    if (!initialized) return;

    const params = new URLSearchParams();
    if (selectedCampaignId && selectedCampaignId !== "all") {
      params.set("campaignId", selectedCampaignId);
    }
    if (dateRange && dateRange !== "7days") {
      params.set("dateRange", dateRange);
    }
    if (performanceMetric && performanceMetric !== "install") {
      params.set("metric", performanceMetric);
    }
    if (topCampaignsSortBy && topCampaignsSortBy !== "spent") {
      params.set("topCampaignsSortBy", topCampaignsSortBy);
    }
    if (topCampaignsLimit && topCampaignsLimit !== 10) {
      params.set("topCampaignsLimit", String(topCampaignsLimit));
    }

    const newQuery = params.toString();
    const currentQuery = window.location.search.slice(1);
    if (newQuery !== currentQuery) {
      navigate(`${window.location.pathname}?${newQuery}`, { replace: true });
    }
  }, [selectedCampaignId, dateRange, performanceMetric, topCampaignsSortBy, topCampaignsLimit, initialized, navigate]);

  // Compute dates based on select preset
  const { startDate, endDate } = useMemo(() => getDatesForPreset(dateRange), [dateRange]);

  // Map the date presets to the string expected by the backend
  const apiPreset = useMemo(() => {
    if (dateRange === "7days") return "last_7_days";
    if (dateRange === "30days") return "last_30_days";
    if (dateRange === "90days") return "last_90_days";
    return dateRange; // e.g. "today", "yesterday"
  }, [dateRange]);

  // --- Data fetching ---
  // Fetch live dashboard summary metrics
  const { data: summaryResponse, isLoading, isError, error } = useGetDashboardSummary(initialized, {
    preset: apiPreset,
    startDate,
    endDate,
    campaignId: selectedCampaignId === "all" ? undefined : selectedCampaignId,
  });

  // Fetch live dashboard performance metrics
  const { data: performanceResponse, isLoading: isPerformanceLoading, isError: isPerformanceError, error: performanceError } = useGetDashboardPerformance(initialized, {
    preset: apiPreset,
    startDate,
    endDate,
    campaignId: selectedCampaignId === "all" ? undefined : selectedCampaignId,
    metric: performanceMetric === "clicks" ? "click" : performanceMetric,
  });

  // Fetch campaigns for the campaign selection dropdown
  const { data: campaignsResponse } = useGetCampaignOptions(initialized);

  // Fetch live dashboard goal report metrics
  const { data: goalReportResponse, isLoading: isGoalReportLoading, isError: isGoalReportError, error: goalReportError } = useGetDashboardGoalReport(initialized, {
    preset: apiPreset,
    startDate,
    endDate,
    campaignId: selectedCampaignId === "all" ? undefined : selectedCampaignId,
  });

  // Fetch live dashboard top campaigns
  const { data: topCampaignsResponse, isLoading: isTopCampaignsLoading, isError: isTopCampaignsError, error: topCampaignsError } = useGetDashboardTopCampaigns(initialized, {
    preset: apiPreset,
    startDate,
    endDate,
    sortBy: topCampaignsSortBy,
    limit: topCampaignsLimit,
  });

  // --- Console Logging Responses ---
  useEffect(() => {
    if (summaryResponse) {
      console.log("Summary API Response:", summaryResponse);
    }
  }, [summaryResponse]);

  useEffect(() => {
    if (performanceResponse) {
      console.log("Performance API Response:", performanceResponse);
    }
  }, [performanceResponse]);

  useEffect(() => {
    if (goalReportResponse) {
      console.log("Goal Report API Response:", goalReportResponse);
    }
  }, [goalReportResponse]);

  useEffect(() => {
    if (topCampaignsResponse) {
      console.log("Top Campaigns API Response:", topCampaignsResponse);
    }
  }, [topCampaignsResponse]);

  // --- Data mapping ---
  const campaignsList = useMemo(() => {
    return (campaignsResponse?.data as Array<{ id: string; value: string }>) ?? [];
  }, [campaignsResponse]);

  const summary = summaryResponse?.data?.data;

  // Extract variables with API data (and defaults for empty states)
  const spentVal = summary?.spent?.value ?? 0;
  const spentChange = summary?.spent?.changePct ?? 0;


  const installVal = summary?.install?.value ?? 0;
  const installChange = summary?.install?.changePct ?? 0;

  const eventsVal = summary?.events?.value ?? 0;
  const eventsChange = summary?.events?.changePct ?? 0;

  const reEngagementsActive = summary?.reEngagements?.active ?? 0;
  const reEngagementsTotal = summary?.reEngagements?.total ?? 0;

  const campaignsActive = summary?.campaigns?.active ?? 0;
  const campaignsTotal = summary?.campaigns?.total ?? 0;

  // Trend formatting
  const trendSpent = `${spentChange >= 0 ? "+" : ""}${spentChange.toFixed(2)}%`;
  const trendInstall = `${installChange >= 0 ? "+" : ""}${installChange.toFixed(2)}%`;
  const trendEvents = `${eventsChange >= 0 ? "+" : ""}${eventsChange.toFixed(2)}%`;

  // Performance chart data builder
  const chartData = useMemo(() => {
    const currentList = performanceResponse?.data?.data?.current ?? [];
    const previousList = performanceResponse?.data?.data?.previous ?? [];

    return currentList.map((item: any, idx: number) => {
      const dateVal = item.date; // e.g. "2026-05-01"
      let formattedDate = dateVal;
      try {
        const parts = dateVal.split("-");
        if (parts.length === 3) {
          formattedDate = `${parts[1]}/${parts[2]}`; // MM/DD
        }
      } catch (e) {
        // fallback
      }

      const prevItem = previousList[idx];
      const prevVal = prevItem ? prevItem.value : 0;

      return {
        date: formattedDate,
        "7 Days": item.value ?? 0,
        "Previous 7 Days": prevVal,
      };
    });
  }, [performanceResponse]);

  const goalReportData = useMemo(() => {
    const apiData = (goalReportResponse?.data?.data as Array<{ eventName: string; value: number }>) ?? [];
    return apiData.map((item) => {
      // Capitalize first letter of each word (e.g. re-engagement -> Re-engagement)
      const capitalized = item.eventName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");
      return {
        name: capitalized,
        value: item.value,
      };
    });
  }, [goalReportResponse]);

  // Goal chart horizontal grid X-axis domain details
  const goalXDomain = useMemo(() => {
    const maxVal = goalReportData.reduce((max, item) => Math.max(max, item.value), 0);
    if (maxVal === 0) return [0, 100];
    if (maxVal <= 10) return [0, 20];
    const offset = Math.max(25, Math.ceil(maxVal * 0.1));
    return [0, maxVal + offset];
  }, [goalReportData]);

  const topCampaignsList = useMemo(() => {
    const apiData = (topCampaignsResponse?.data?.data as Array<{
      campaignId: string;
      title: string;
      status: string;
      click: number;
      install: number;
      events: number;
      spent: number;
    }>) ?? [];

    return apiData.map((item) => ({
      _id: item.campaignId,
      title: item.title,
      status: item.status === "active" ? "Active" : item.status,
      clicks: item.click,
      installs: item.install,
      events: item.events,
      spent: item.spent,
    }));
  }, [topCampaignsResponse]);

  if (!initialized || isLoading || isPerformanceLoading || isGoalReportLoading || isTopCampaignsLoading) {
    return <LoadingFallback />;
  }

  if (isError || isPerformanceError || isGoalReportError || isTopCampaignsError) {
    const err = error || performanceError || goalReportError || topCampaignsError;
    return (
      <div className="text-center text-destructive p-8 bg-destructive/10 rounded-2xl border border-destructive/20 max-w-2xl mx-auto my-8">
        Error loading dashboard metrics: {err?.message || "Something went wrong"}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Dashboard Top Filter Control Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Campaign Selector */}
          <Select
            value={selectedCampaignId}
            onValueChange={setSelectedCampaignId}
          >
            <SelectTrigger className="w-full sm:w-[220px] bg-card border-border/60">
              <SelectValue placeholder="Select Campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select Campaign</SelectItem>
              {campaignsList.map((camp) => (
                <SelectItem key={camp.id} value={camp.id}>
                  {camp.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Selector */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[150px] bg-card border-border/60">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Spent"
          value={formatCurrency(spentVal)}
          subtext={`${trendSpent} from last 7 days`}
          trendType="up"
          icon={<Wallet className="w-5 h-5" />}
        />
        <StatCard
          title="Install"
          value={formatNumber(installVal)}
          subtext={`${trendInstall} from last 7 days`}
          trendType="up"
          icon={<Download className="w-5 h-5" />}
        />
        <StatCard
          title="Events"
          value={formatNumber(eventsVal)}
          subtext={`${trendEvents} from last 7 days`}
          trendType="up"
          icon={<Layers className="w-5 h-5" />}
        />
        <StatCard
          title="Re-Engagements"
          value={`${reEngagementsActive}/${reEngagementsTotal}`}
          subtext="Active/Total"
          trendType="muted"
          icon={<Magnet className="w-5 h-5" />}
        />
        <StatCard
          title="Campaigns"
          value={`${campaignsActive}/${campaignsTotal}`}
          subtext="Active/Total"
          trendType="muted"
          icon={<Send className="w-5 h-5" />}
        />
      </div>

      {/* Two-Column Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <PerformanceChart
          chartData={chartData}
          metric={performanceMetric}
          onMetricChange={setPerformanceMetric}
        />
        <GoalReportChart
          goalReportData={goalReportData}
          goalXDomain={goalXDomain}
        />
      </div>

      {/* Top Campaigns Table Section */}
      <CampaignsTable
        enrichedCampaigns={topCampaignsList}
        formatNumber={formatNumber}
        formatCurrency={formatCurrency}
        sortBy={topCampaignsSortBy}
        onSortByChange={setTopCampaignsSortBy}
        limit={topCampaignsLimit}
        onLimitChange={setTopCampaignsLimit}
      />
    </div>
  );
}

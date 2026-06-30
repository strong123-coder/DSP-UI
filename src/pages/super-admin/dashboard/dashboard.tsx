import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Download,
  MousePointerClick,
  Activity,
  Building2,
  Megaphone,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/pages/dashboard/components/StatCard";
import { MetricValue } from "@/components/ui/metric-value";
import { LiveCounters } from "@/pages/super-admin/components/live-counters";
import { useAppStore } from "@/store";
import { useSuperAdminSummary, useSuperAdminOrgs } from "@/query/useSuperAdmin";

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "last_7_days" },
  { label: "Last 30 days", value: "last_30_days" },
  { label: "Last 90 days", value: "last_90_days" },
];

const pct = (n: number) => `${n > 0 ? "+" : ""}${n ?? 0}%`;

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { enterOrg } = useAppStore();
  const [preset, setPreset] = useState("last_30_days");

  const { data: summaryResp, isLoading: loadingSummary } = useSuperAdminSummary(
    { preset },
  );
  const { data: orgsResp, isLoading: loadingOrgs } = useSuperAdminOrgs({
    preset,
  });

  const s = summaryResp?.data?.data;
  const orgs: any[] = orgsResp?.data?.data ?? [];

  const queryClient = useQueryClient();

  const handleEnter = (org: { orgId: string; name: string }) => {
    queryClient.removeQueries({ queryKey: ["orgConfig"] }); // force AuthGuard to refetch for entered org
    enterOrg({ id: org.orgId, name: org.name });
    navigate("/dashboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Overview</h1>
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
          className="h-9 rounded-md border border-border bg-card px-3 text-sm"
        >
          {PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Live engine counters (polled from the bid engine via the backend) */}
      <LiveCounters intervalMs={5000} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Spent"
          value={
            loadingSummary ? (
              "…"
            ) : (
              <MetricValue value={s?.spent?.value} currency decimals={2} />
            )
          }
          subtext={pct(s?.spent?.changePct)}
          trendType="up"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          title="Installs"
          value={
            loadingSummary ? "…" : <MetricValue value={s?.install?.value} />
          }
          subtext={pct(s?.install?.changePct)}
          trendType="up"
          icon={<Download className="w-4 h-4" />}
        />
        <StatCard
          title="Clicks"
          value={loadingSummary ? "…" : <MetricValue value={s?.click?.value} />}
          subtext={pct(s?.click?.changePct)}
          trendType="up"
          icon={<MousePointerClick className="w-4 h-4" />}
        />
        <StatCard
          title="Events"
          value={
            loadingSummary ? "…" : <MetricValue value={s?.events?.value} />
          }
          subtext={pct(s?.events?.changePct)}
          trendType="up"
          icon={<Activity className="w-4 h-4" />}
        />
        <StatCard
          title="Organizations"
          value={loadingSummary ? "…" : <MetricValue value={s?.orgs?.total} />}
          subtext="total"
          trendType="muted"
          icon={<Building2 className="w-4 h-4" />}
        />
        <StatCard
          title="Campaigns"
          value={
            loadingSummary ? "…" : <MetricValue value={s?.campaigns?.total} />
          }
          subtext={`${s?.campaigns?.active ?? 0} active`}
          trendType="muted"
          icon={<Megaphone className="w-4 h-4" />}
        />
      </div>

      {/* Organizations table */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Organizations</h2>
            {loadingOrgs && (
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-medium">Organization</th>
                  <th className="px-5 py-3 font-medium">Admin</th>
                  <th className="px-5 py-3 font-medium text-right">
                    Active Campaigns
                  </th>
                  <th className="px-5 py-3 font-medium text-right">Spent</th>
                  <th className="px-5 py-3 font-medium text-right">Installs</th>
                  <th className="px-5 py-3 font-medium text-right">Clicks</th>
                  <th className="px-5 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {orgs.length === 0 && !loadingOrgs && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-muted-foreground"
                    >
                      No organizations found.
                    </td>
                  </tr>
                )}
                {orgs.map((o) => (
                  <tr
                    key={o.orgId}
                    className="border-b border-border/60 hover:bg-muted/40"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium">{o.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.subdomain}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {o.adminEmail || "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <MetricValue value={o.activeCampaigns} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <MetricValue value={o.spent} currency decimals={2} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <MetricValue value={o.install} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <MetricValue value={o.click} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleEnter(o)}
                      >
                        Enter <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

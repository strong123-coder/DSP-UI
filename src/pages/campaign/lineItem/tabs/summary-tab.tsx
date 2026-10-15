import React from "react";
import { useFormContext } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { geoData } from "@/utils/data/data";
import type { LineItemFormValues } from "@/utils/schemas/lineItem";

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-3 py-2 border-b border-border/60 last:border-0 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 break-words">{children}</dd>
  </div>
);

const country = (c: string) => geoData.find((g) => g.value === c)?.name || c;

// Read-only review of everything set on the other tabs.
const SummaryTab: React.FC<{ campaign: any; advertiserName: string }> = ({ campaign, advertiserName }) => {
  const v = useFormContext<LineItemFormValues>().watch();
  const cur = campaign.currency || "USD";
  const unit = campaign.budgetType === "impressions" ? "impressions" : cur;
  const inc = v.targeting.geo.countries.include;
  const exc = v.targeting.geo.countries.exclude;

  const warnings: string[] = [];
  if (v.creatives.length === 0) warnings.push("No creatives attached: this line item can't bid until you attach one.");
  if (v.status === "paused") warnings.push("This line item is paused and won't bid until you activate it.");
  if (campaign.status !== "active") warnings.push("The campaign itself is paused, so none of its line items bid.");

  return (
    <div className="space-y-5">
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5">
          {warnings.map((w) => (
            <div key={w} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /> {w}
            </div>
          ))}
        </div>
      )}
      <Card>
        <CardHeader><CardTitle className="text-base">Line item</CardTitle></CardHeader>
        <CardContent>
          <dl>
            <Row label="Name">{v.name || "—"}</Row>
            <Row label="Advertiser / Campaign">{advertiserName} · {campaign.title}</Row>
            <Row label="Format"><span className="capitalize">{v.format}</span></Row>
            <Row label="Status"><span className="capitalize">{v.status}</span></Row>
            <Row label="Flight">{v.startDate || "Campaign start"} → {v.endDate || "Campaign end"}</Row>
            <Row label="Budget">{v.budget ? `${v.budget} ${unit}` : "Shares the campaign budget"}</Row>
            <Row label="Daily budget">{v.dailyBudget ? `${v.dailyBudget} ${unit}` : "Shares the campaign daily budget"}{v.pacing === "even" ? " · even pacing" : ""}</Row>
            <Row label="Bid">
              {v.bidding.strategy === "fixed_cpm" ? `${v.bidding.cpm || "—"} ${cur} CPM` : "Campaign bid"}
              {v.bidding.maxCpm ? ` · max ${v.bidding.maxCpm} ${cur}` : ""}
            </Row>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Targeting</CardTitle></CardHeader>
        <CardContent>
          <dl>
            <Row label="Countries">{inc.length ? inc.map(country).join(", ") : "All countries"}</Row>
            <Row label="Excluded">{exc.length ? exc.map(country).join(", ") : "None"}</Row>
            <Row label="Regions / cities">
              {v.targeting.geo.custom.length
                ? v.targeting.geo.custom.map((r) => [r.city, r.state, r.country].filter(Boolean).join(", ")).join(" · ")
                : "None"}
            </Row>
            <Row label="App OS">{campaign.appOs ? `${campaign.appOs} (from the campaign)` : "Any"}</Row>
            <Row label="Audience">
              {v.targeting.segments.audienceTarget === "custom"
                ? `Custom: ${v.targeting.segments.customAudienceIds.join(", ") || "none listed"}`
                : "All eligible"}
            </Row>
            <Row label="Inventory">
              {v.targeting.exchange.inventoryType === "oem_premium_partners"
                ? `OEM & premium partners${v.targeting.exchange.oemPremiumPartners.length ? `: ${v.targeting.exchange.oemPremiumPartners.join(", ")}` : ""}`
                : "Programmatic"}
            </Row>
            <Row label="Creatives">{v.creatives.length} attached</Row>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryTab;

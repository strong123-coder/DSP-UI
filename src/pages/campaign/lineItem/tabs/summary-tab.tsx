import React from "react";
import { useFormContext } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { geoData } from "@/utils/data/data";
import { DAYS, LanguageData } from "@/utils/data/targetingData";
import { useTargetingOptions } from "@/query/useLineItem";
import { useTargetingListOptions } from "@/query/useTargetingList";
import { useLineItemNetwork } from "../line-item-network";
import { useBidModifier } from "@/query/useBidModifier";
import { useDeliveryModifier } from "@/query/useDeliveryModifier";
import type { TargetingOptions } from "@/services/lineItem";
import type { LineItemFormValues } from "@/utils/schemas/lineItem";

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-3 py-2 border-b border-border/60 last:border-0 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 break-words">{children}</dd>
  </div>
);

const country = (c: string) => geoData.find((g) => g.value === c)?.name || c;

// "Include: a, b · Exclude: c", or the fallback when the rule is unset.
const ieText = (v: { include: Array<string | number>; exclude: Array<string | number> }, none: string, name = (x: string) => x, max = 12) => {
  const part = (label: string, xs: Array<string | number>) => {
    const names = xs.map((x) => name(String(x)));
    return `${label}: ${names.slice(0, max).join(", ")}${names.length > max ? ` +${names.length - max} more` : ""}`;
  };
  const parts = [];
  if (v.include.length) parts.push(part("Include", v.include));
  if (v.exclude.length) parts.push(part("Exclude", v.exclude));
  return parts.length ? parts.join(" · ") : none;
};

// Slots → "Mon–Fri 09:00–18:00"-style text, one entry per day pattern.
const scheduleText = (slots: number[], tz: string) => {
  if (!slots.length) return "Every hour";
  const byDay = DAYS.map((_, d) => slots.filter((s) => Math.floor(s / 24) === d).map((s) => s % 24));
  const hoursText = (hs: number[]) => {
    if (!hs.length) return "";
    const runs: string[] = [];
    let start = hs[0];
    for (let i = 1; i <= hs.length; i++) {
      if (i === hs.length || hs[i] !== hs[i - 1] + 1) {
        runs.push(`${String(start).padStart(2, "0")}:00–${String(hs[i - 1] + 1).padStart(2, "0")}:00`);
        if (i < hs.length) start = hs[i];
      }
    }
    return runs.join(", ");
  };
  const groups: Array<{ days: string[]; text: string }> = [];
  byDay.forEach((hs, d) => {
    const t = hoursText(hs);
    if (!t) return;
    const g = groups.find((x) => x.text === t);
    if (g) g.days.push(DAYS[d]);
    else groups.push({ days: [DAYS[d]], text: t });
  });
  return `${groups.map((g) => `${g.days.join(", ")} ${g.text}`).join(" · ")} (${tz || "UTC"})`;
};

// Read-only review of everything set on the other tabs.
const SummaryTab: React.FC<{ campaign: any; advertiserName: string }> = ({ campaign, advertiserName }) => {
  const v = useFormContext<LineItemFormValues>().watch();
  const networkId = useLineItemNetwork();
  const { data: optResp } = useTargetingOptions();
  const options: TargetingOptions | undefined = optResp?.data;
  const { data: listResp } = useTargetingListOptions("bundle", networkId);
  const lists: Array<{ id: string; value: string }> = listResp?.data ?? [];
  const t = v.targeting;
  const { data: zipResp } = useTargetingListOptions("zip", networkId);
  const { data: dealResp } = useTargetingListOptions("deal", networkId);
  const allLists: Array<{ id: string; value: string }> = [...lists, ...(zipResp?.data ?? []), ...(dealResp?.data ?? [])];
  const listName = (id: string) => allLists.find((l) => l.id === id)?.value || id;
  const { data: modResp } = useBidModifier(v.bidModifierId || null);
  const { data: dmodResp } = useDeliveryModifier(v.deliveryModifierId || null);
  const weighted = v.creatives.some((c) => c.weight !== 1);
  const connName = (x: string) => options?.connectionTypes?.find((d) => String(d.value) === x)?.name || x;
  const deviceName = (x: string) => options?.deviceTypes.find((d) => String(d.value) === x)?.name || x;
  const partnerName = (id: string) => options?.supplyPartners.find((p) => p.id === id)?.name || id;
  const campaignName = (id: string | null) =>
    !id || id === campaign._id ? "this campaign" : options?.campaigns.find((c) => c.id === id)?.title || id;
  const verb = (s: string) => (s === "clickers" ? "clicked" : s === "viewers" ? "saw" : "saw or clicked");
  const rtText = (rows: Array<{ campaignId: string | null; segment: string }>) =>
    rows.map((r) => `${verb(r.segment)} ${campaignName(r.campaignId)}'s ads`).join(", or ");
  const osv = t.platform.osVersion;
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
            <Row label="Frequency cap">
              {v.frequencyCaps.length
                ? v.frequencyCaps.map((c) => `${c.count} every ${c.every} ${c.unit}${Number(c.every) > 1 ? "s" : ""}`).join(" and ") + " per user"
                : "None"}
            </Row>
            <Row label="Flights">
              {v.flights.length
                ? v.flights
                    .map((f) => `${f.startDate || "?"} → ${f.endDate || "?"}${f.budget ? ` (${f.budget} ${unit})` : ""}`)
                    .join(" · ")
                : "None: runs continuously"}
            </Row>
            <Row label="Bid modifier">{v.bidModifierId ? modResp?.data?.data?.name || "Selected" : "None"}</Row>
            <Row label="Delivery modifier">
              {v.deliveryModifierId ? dmodResp?.data?.data?.name || "Selected" : "None: bids on every eligible request"}
            </Row>
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
            <Row label="Metros">{ieText(t.geo.metros, "Any")}</Row>
            <Row label="Postal codes">{ieText(t.geo.zips, "Any")}</Row>
            <Row label="ZIP lists">{ieText(t.geo.zipLists, "None", listName)}</Row>
            <Row label="Apps / sites">{ieText(t.inventory.bundles, "Any")}</Row>
            <Row label="Bundle lists">{ieText(t.inventory.bundleLists, "None", listName)}</Row>
            <Row label="Deals">
              {t.inventory.deals.include.length || t.inventory.dealLists.include.length
                ? `Deal-only · ${ieText(t.inventory.deals, "", (x) => x)}${t.inventory.dealLists.include.length ? ` · lists: ${t.inventory.dealLists.include.map(listName).join(", ")}` : ""}`
                : ieText(t.inventory.deals, "Open auction")}
            </Row>
            <Row label="Categories">{ieText(t.content.categories, "Any")}</Row>
            <Row label="Languages">
              {ieText(t.content.languages, "Any", (x) => LanguageData.find((l) => l.value === x)?.name || x)}
            </Row>
            <Row label="Environment">
              {t.environment.channels.length
                ? t.environment.channels.map((c) => (c === "app" ? "In-app" : "Mobile web")).join(" and ")
                : "In-app and mobile web"}
            </Row>
            <Row label="App OS">{campaign.appOs ? `${campaign.appOs} (from the campaign)` : "Any"}</Row>
            <Row label="OS version">
              {osv.min || osv.max ? `${osv.min ? `${osv.min} or later` : ""}${osv.min && osv.max ? ", " : ""}${osv.max ? `up to ${osv.max}` : ""}` : "Any"}
            </Row>
            <Row label="Device types">{ieText(t.platform.deviceTypes, "Any", deviceName)}</Row>
            <Row label="Makes / models">
              {[ieText(t.platform.makes, ""), ieText(t.platform.models, "")].filter(Boolean).join(" · ") || "Any"}
            </Row>
            <Row label="Network">
              {[ieText(t.platform.carriers, ""), ieText(t.platform.connectionTypes, "", connName)].filter(Boolean).join(" · ") || "Any"}
            </Row>
            <Row label="Schedule">{scheduleText(t.time.slots, t.time.timezone)}</Row>
            <Row label="Retargeting">
              {t.segments.retargeting.include.length || t.segments.retargeting.exclude.length
                ? [
                    t.segments.retargeting.include.length ? `Only people who ${rtText(t.segments.retargeting.include)}` : "",
                    t.segments.retargeting.exclude.length ? `Never people who ${rtText(t.segments.retargeting.exclude)}` : "",
                  ].filter(Boolean).join(" · ")
                : "None"}
            </Row>
            <Row label="Advertising ID">{t.segments.requireDeviceId ? "Required" : "Not required"}</Row>
            <Row label="Supply partners">{ieText(t.exchange.supplyPartners, "Any", partnerName)}</Row>
            <Row label="Zones">{ieText(t.exchange.zones, "Any")}</Row>
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
            <Row label="Creatives">
              {v.creatives.length} attached{weighted ? ` · weighted rotation (${v.creatives.map((c) => c.weight).join(" : ")})` : ""}
            </Row>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryTab;

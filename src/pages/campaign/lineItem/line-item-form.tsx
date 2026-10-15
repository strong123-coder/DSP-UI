import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronRight, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useGetSingleCampaign } from "@/query/useCampaign";
import { useCreateLineItem, useLineItem, useUpdateLineItem } from "@/query/useLineItem";
import {
  browserTimezone,
  lineItemSchema,
  targetingToForm,
  toLineItemPayload,
  type LineItemFormValues,
} from "@/utils/schemas/lineItem";
import { fromFrequencyCaps } from "@/components/targeting/frequency-caps-editor";
import GeneralTab from "./tabs/general-tab";
import TargetingTab from "./tabs/targeting-tab";
import CreativesTab from "./tabs/creatives-tab";
import SummaryTab from "./tabs/summary-tab";
import ModifiersTab from "./tabs/modifiers-tab";
import LineItemPresets, { applyPresetToForm } from "./components/line-item-presets";
import { useAdvertiser } from "@/query/useAdvertiser";
import { useFetchPreset } from "@/query/usePreset";

type TabId = "general" | "targeting" | "modifiers" | "creatives" | "summary";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "general", label: "General" },
  { id: "targeting", label: "Targeting" },
  { id: "modifiers", label: "Modifiers" },
  { id: "creatives", label: "Creative Association" },
  { id: "summary", label: "Summary" },
];

// Which tab each field lives on, so a validation error opens the right tab.
const FIELD_TAB: Record<string, TabId> = {
  name: "general",
  status: "general",
  startDate: "general",
  endDate: "general",
  budget: "general",
  dailyBudget: "general",
  bidding: "general",
  frequencyCaps: "general",
  flights: "general",
  bidModifierId: "modifiers",
  deliveryModifierId: "modifiers",
  targeting: "targeting",
  creatives: "creatives",
};

const firstError = (errors: any, path: string[] = []): { path: string; message: string } | null => {
  for (const [k, v] of Object.entries(errors || {})) {
    if (!v) continue;
    if ((v as any).message && typeof (v as any).message === "string") {
      return { path: [...path, k].join("."), message: (v as any).message };
    }
    const nested = firstError(v, [...path, k]);
    if (nested) return nested;
  }
  return null;
};

const LineItemForm: React.FC = () => {
  const { campaignId, lineItemId } = useParams<{ campaignId: string; lineItemId?: string }>();
  const isEdit = !!lineItemId;
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("general");

  const { data: campResp, isLoading: campLoading } = useGetSingleCampaign(campaignId || "");
  const { data: liResp, isLoading: liLoading } = useLineItem(lineItemId);
  const createMut = useCreateLineItem();
  const updateMut = useUpdateLineItem();

  const campaign = campResp?.data?.data;
  const lineItem = liResp?.data?.data;
  const format: "banner" | "video" = campaign?.type === "ctv" ? "video" : "banner";

  const defaults = useMemo<LineItemFormValues>(
    () => ({
      name: "",
      format,
      status: "paused",
      alternativeId: "",
      notes: "",
      startDate: "",
      endDate: "",
      budget: "",
      dailyBudget: "",
      pacing: "asap",
      frequencyCaps: [],
      flights: [],
      bidModifierId: "",
      deliveryModifierId: "",
      bidding: { strategy: "inherit", cpm: "", maxCpm: "" },
      targeting: targetingToForm(undefined, browserTimezone()),
      creatives: [],
    }),
    [format],
  );

  const methods = useForm<LineItemFormValues>({ resolver: zodResolver(lineItemSchema), defaultValues: defaults });

  // A new line item starts from the advertiser's default presets (line item
  // preset first, then its targeting preset on top), once.
  const advertiserId = (campaign?.advertiser as { id: string } | null)?.id;
  const { data: advResp } = useAdvertiser(!isEdit ? advertiserId : undefined);
  const advDefaults = advResp?.data?.data?.defaults;
  const fetchPreset = useFetchPreset();
  const presetsApplied = useRef(false);
  useEffect(() => {
    if (isEdit || !campaign || !advDefaults || presetsApplied.current) return;
    presetsApplied.current = true;
    const ids = [advDefaults.lineItemPresetId, advDefaults.targetingPresetId].filter(Boolean) as string[];
    if (!ids.length) return;
    (async () => {
      const names: string[] = [];
      for (const id of ids) {
        try {
          const p = await fetchPreset(id);
          applyPresetToForm(p, methods.setValue);
          names.push(p.name);
        } catch {
          /* a deleted default preset just isn't applied */
        }
      }
      if (names.length) toast.info(`Started from the advertiser's preset${names.length > 1 ? "s" : ""}: ${names.join(", ")}`);
    })();
  }, [isEdit, campaign, advDefaults, fetchPreset, methods]);

  // New line item: start from the advertiser's default geo. Edit: the saved one.
  useEffect(() => {
    if (isEdit && lineItem) {
      const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
      methods.reset({
        name: lineItem.name,
        format: lineItem.format,
        status: lineItem.status,
        alternativeId: lineItem.alternativeId || "",
        notes: lineItem.notes || "",
        startDate: lineItem.startDate ? String(lineItem.startDate).slice(0, 10) : "",
        endDate: lineItem.endDate ? String(lineItem.endDate).slice(0, 10) : "",
        budget: s(lineItem.budget),
        dailyBudget: s(lineItem.dailyBudget),
        pacing: lineItem.pacing || "asap",
        frequencyCaps: fromFrequencyCaps(lineItem.frequencyCaps),
        flights: (lineItem.flights || []).map((f: any) => ({
          startDate: String(f.startDate).slice(0, 10),
          endDate: String(f.endDate).slice(0, 10),
          budget: f.budget === null || f.budget === undefined ? "" : String(f.budget),
        })),
        bidModifierId: lineItem.bidModifierId || "",
        deliveryModifierId: lineItem.deliveryModifierId || "",
        bidding: {
          strategy: lineItem.bidding?.strategy || "inherit",
          cpm: s(lineItem.bidding?.cpm),
          maxCpm: s(lineItem.bidding?.maxCpm),
        },
        targeting: targetingToForm(lineItem.targeting, browserTimezone()),
        creatives: (lineItem.creatives || []).map((c: { creativeId: string; weight?: number }) => ({
          creativeId: c.creativeId,
          weight: c.weight || 1,
        })),
      });
    } else if (!isEdit && campaign) {
      methods.reset({ ...defaults, format });
    }
  }, [isEdit, lineItem, campaign, defaults, format, methods]);

  if (campLoading || (isEdit && liLoading) || !campaign) return <LoadingFallback />;

  const advertiser = campaign.advertiser as { id: string; name: string } | null;
  if (!advertiser) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm">
        This campaign has no advertiser yet, and a line item's creatives belong to an advertiser.{" "}
        <Link to={`/campaign/edit/${campaignId}`} className="font-medium text-primary hover:underline">
          Pick an advertiser for the campaign
        </Link>{" "}
        first.
      </div>
    );
  }

  const saving = createMut.isPending || updateMut.isPending;
  const back = () => navigate(`/campaign/view/${campaignId}`);

  const onSubmit = (v: LineItemFormValues) => {
    const payload = toLineItemPayload(v);
    if (isEdit) {
      const { format: _format, ...patch } = payload; // format is fixed by the campaign type
      updateMut.mutate({ id: lineItemId!, payload: patch }, { onSuccess: back });
    } else {
      createMut.mutate({ ...payload, campaignId }, { onSuccess: back });
    }
  };

  const onInvalid = (errors: any) => {
    const err = firstError(errors);
    if (!err) return;
    const t = FIELD_TAB[err.path.split(".")[0]];
    if (t) setTab(t);
    toast.error(err.message);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onInvalid)} className="space-y-5 pb-24">
        {/* Breadcrumb: Advertisers › Advertiser › Campaign › Line item */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap" aria-label="Breadcrumb">
          <Link to="/advertiser/list" className="hover:text-foreground">Advertisers</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/campaign/list?advertiserId=${advertiser.id}`} className="hover:text-foreground">{advertiser.name}</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/campaign/view/${campaignId}`} className="hover:text-foreground">{campaign.title}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{isEdit ? lineItem?.name || "Line item" : "New line item"}</span>
        </nav>

        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold">{isEdit ? lineItem?.name : "New line item"}</h1>
          <Badge variant="outline" className="gap-1 uppercase text-[10px]">
            {format === "video" ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
            {format}
          </Badge>
          <div className="ml-auto">
            <LineItemPresets advertiserId={advertiser.id} advertiserName={advertiser.name} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-5 items-start">
          <div className="min-w-0">
            {tab === "general" && <GeneralTab campaign={campaign} />}
            {tab === "targeting" && <TargetingTab campaignId={campaignId!} campaignType={campaign.type} />}
            {tab === "modifiers" && <ModifiersTab advertiserId={advertiser.id} currency={campaign.currency || "USD"} />}
            {tab === "creatives" && <CreativesTab advertiserId={advertiser.id} format={format} />}
            {tab === "summary" && <SummaryTab campaign={campaign} advertiserName={advertiser.name} />}
          </div>

          {/* Campaign context rail */}
          <Card className="p-5 space-y-3 text-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Campaign</div>
            <div className="font-medium">{campaign.title}</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Budget: {campaign.budget || "—"} {campaign.budgetType === "impressions" ? "imps" : campaign.currency || "USD"}</div>
              <div>Daily: {campaign.dailyBudget || "—"}</div>
              <div>
                Flight:{" "}
                {campaign.startDate ? String(campaign.startDate).slice(0, 10) : "—"} →{" "}
                {campaign.endDate ? String(campaign.endDate).slice(0, 10) : "no end"}
              </div>
              <div>App: {campaign.appName || campaign.bundleId || "—"} {campaign.appOs ? `(${campaign.appOs})` : ""}</div>
            </div>
          </Card>
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-6 py-3 flex items-center gap-3 justify-end z-20">
          <Button type="button" variant="outline" onClick={back} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save line item" : "Create line item"}</Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default LineItemForm;

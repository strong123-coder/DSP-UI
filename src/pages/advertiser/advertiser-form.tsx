import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import SelectComponent from "@/components/inputComponents/select-component";
import MultiSelectComponent from "@/components/inputComponents/multi-select-component";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useAdvertiser, useAdvertiserCategories, useCreateAdvertiser, useUpdateAdvertiser } from "@/query/useAdvertiser";
import { useGetAppDetails } from "@/query/useCampaign";
import { geoData, currencyData } from "@/utils/data/data";
import { MmpPlatformData } from "@/utils/data/campaignData";
import { usePresetOptions } from "@/query/usePreset";
import type { PresetKind } from "@/services/preset";
import { useNetworkOptions } from "@/query/useNetwork";
import { useScope } from "@/query/useScope";
import { useNetwork } from "@/query/useNetwork";
import PublisherCutField, { cutError, cutPayload } from "@/components/budget/publisher-cut-field";

const schema = z.object({
  name: z.string().trim().min(1, { message: "Advertiser name is required" }).max(120),
  domain: z
    .string()
    .trim()
    .min(1, { message: "Advertiser domain is required" })
    .refine((v) => /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v), { message: "Enter a full URL, e.g. https://example.com" }),
  appOs: z.enum(["android", "ios", ""]).optional(),
  appBundle: z.string().trim().optional(),
  appName: z.string().trim().optional(),
  appIconLink: z.string().trim().optional(),
  category: z.string().min(1, { message: "Pick an advertiser category" }),
  alternativeId: z.string().trim().optional(),
  notes: z.string().trim().max(2000).optional(),
  publisherCut: z.string().refine((v) => !cutError(v), { message: "Publisher cut must be 0–90%" }),
  status: z.enum(["active", "paused"]),
  defaults: z.object({
    geo: z.array(z.string()),
    currency: z.string(),
    clickUrl: z.string().trim().optional(),
    mmpPlatform: z.string().optional(),
    campaignPresetId: z.string(),
    lineItemPresetId: z.string(),
    targetingPresetId: z.string(),
  }),
});
type FormValues = z.infer<typeof schema>;

const useDebounced = <T,>(value: T, ms: number) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

const PRESET_DEFAULTS: Array<{ field: "campaignPresetId" | "lineItemPresetId" | "targetingPresetId"; kind: PresetKind; label: string }> = [
  { field: "campaignPresetId", kind: "campaign", label: "Campaign preset" },
  { field: "lineItemPresetId", kind: "lineItem", label: "Line item preset" },
  { field: "targetingPresetId", kind: "targeting", label: "Targeting preset" },
];

// The presets this advertiser can use (its own + org-wide) for one kind.
const PresetSelect: React.FC<{ id: string; kind: PresetKind; advertiserId?: string; value: string; onChange: (v: string) => void }> = ({
  id,
  kind,
  advertiserId,
  value,
  onChange,
}) => {
  const { data } = usePresetOptions(kind, advertiserId);
  const options: Array<{ id: string; value: string }> = data?.data ?? [];
  return (
    <SelectComponent id={id} value={value || "__none__"}
      data={[{ name: "None", value: "__none__" }, ...options.map((o) => ({ name: o.value, value: String(o.id) }))]}
      onValueChange={(v) => onChange(v === "__none__" ? "" : v)} />
  );
};

const AdvertiserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: advResp, isLoading } = useAdvertiser(id);
  const { data: catResp } = useAdvertiserCategories();
  const createMut = useCreateAdvertiser();
  const updateMut = useUpdateAdvertiser();
  const categories: Array<{ id: string; value: string }> = catResp?.data ?? [];

  // At org level a new advertiser goes into a network the org picks (inside a
  // network it joins that network). It can't move later.
  const scope = useScope();
  const [search] = useSearchParams();
  const pickNetwork = !isEdit && scope.orgLevel && scope.canManageNetworks;
  const { data: netResp } = useNetworkOptions(pickNetwork);
  const networks: Array<{ id: string; value: string; status: string }> = netResp?.data ?? [];
  const [pickedNetwork, setNetworkId] = useState(search.get("networkId") || "");
  // The org's only network needs no picking.
  const networkId = pickedNetwork || (networks.length === 1 ? String(networks[0].id) : "");
  // A new advertiser without its own cut uses the picked network's.
  const { data: pickedNetResp } = useNetwork(pickNetwork && networkId ? networkId : undefined);
  const pickedNetworkCut: number | null = pickedNetResp?.data?.data?.publisherCut ?? null;

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      domain: "",
      appOs: "",
      appBundle: "",
      appName: "",
      appIconLink: "",
      category: "",
      alternativeId: "",
      notes: "",
      publisherCut: "",
      status: "active",
      defaults: { geo: [], currency: "USD", clickUrl: "", mmpPlatform: "appsflyer", campaignPresetId: "", lineItemPresetId: "", targetingPresetId: "" },
    },
  });

  const adv = advResp?.data?.data;
  useEffect(() => {
    if (adv) {
      reset({
        name: adv.name || "",
        domain: adv.domain || "",
        appOs: adv.appOs || "",
        appBundle: adv.appBundle || "",
        appName: adv.appName || "",
        appIconLink: adv.appIconLink || "",
        category: adv.category || "",
        alternativeId: adv.alternativeId || "",
        notes: adv.notes || "",
        publisherCut: adv.publisherCut === null || adv.publisherCut === undefined ? "" : String(adv.publisherCut),
        status: adv.status || "active",
        defaults: {
          geo: adv.defaults?.geo || [],
          currency: adv.defaults?.currency || "USD",
          clickUrl: adv.defaults?.clickUrl || "",
          mmpPlatform: adv.defaults?.mmpPlatform || "appsflyer",
          campaignPresetId: adv.defaults?.campaignPresetId || "",
          lineItemPresetId: adv.defaults?.lineItemPresetId || "",
          targetingPresetId: adv.defaults?.targetingPresetId || "",
        },
      });
    }
  }, [adv, reset]);

  // Store lookup for the default app: fills the app name and icon.
  const appOs = watch("appOs");
  const appBundle = useDebounced(watch("appBundle") || "", 500);
  const appIcon = watch("appIconLink");
  const { data: appResp, isFetching: appLoading, isError: appError } = useGetAppDetails(
    { bundleId: appBundle, platform: (appOs || "android") as "android" | "ios" },
    !!appOs && appBundle.length > 2 && appBundle !== adv?.appBundle,
  );
  useEffect(() => {
    const app = appResp?.data?.data;
    if (app) {
      setValue("appName", app.title || "");
      setValue("appIconLink", app.iconUrl || "");
    }
  }, [appResp, setValue]);

  const onSubmit = (v: FormValues) => {
    const { publisherCut, ...rest } = v;
    const payload = {
      ...rest,
      // The org's cut: never sent by (or shown to) network users.
      ...(scope.networkUser ? {} : { publisherCut: cutPayload(publisherCut) }),
      appOs: v.appOs || null,
      appBundle: v.appBundle || null,
      appName: v.appName || null,
      appIconLink: v.appIconLink || null,
      defaults: {
        ...v.defaults,
        clickUrl: v.defaults.clickUrl || null,
        mmpPlatform: v.defaults.mmpPlatform || null,
        campaignPresetId: v.defaults.campaignPresetId || null,
        lineItemPresetId: v.defaults.lineItemPresetId || null,
        targetingPresetId: v.defaults.targetingPresetId || null,
      },
    } as any;
    const done = () => navigate("/advertiser/list");
    if (isEdit) updateMut.mutate({ id: id!, payload }, { onSuccess: done });
    else {
      if (pickNetwork && !networkId) return toast.error("Pick the network this advertiser belongs to");
      createMut.mutate(pickNetwork ? { ...payload, networkId } : payload, { onSuccess: done });
    }
  };

  if (isEdit && isLoading) return <LoadingFallback />;
  const saving = createMut.isPending || updateMut.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit, (e) => toast.error(Object.values(e)[0]?.message?.toString() || "Check the highlighted fields"))}
      className="space-y-5 pb-24 max-w-5xl">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/advertiser/list" className="hover:text-foreground">Advertisers</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{isEdit ? adv?.name || "Edit advertiser" : "Create advertiser"}</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Essential settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pickNetwork && (
            <div className="space-y-2 md:col-span-3 max-w-sm">
              <Label htmlFor="network">Network <span className="text-destructive">*</span></Label>
              <SelectComponent id="network" search placeholder="Select network" value={networkId}
                data={networks.map((n) => ({ name: n.status === "active" ? n.value : `${n.value} (off)`, value: String(n.id) }))}
                onValueChange={setNetworkId} />
              <p className="text-xs text-muted-foreground">The network sees and runs this advertiser. It can't be moved later.</p>
            </div>
          )}
          {isEdit && scope.orgLevel && adv?.networkName && (
            <div className="space-y-1 md:col-span-3 text-sm">
              <span className="text-muted-foreground">Network: </span><span className="font-medium">{adv.networkName}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Advertiser name <span className="text-destructive">*</span></Label>
            <Input id="name" placeholder="e.g. Snoop" {...register("name")} aria-invalid={!!errors.name} errorTooltip={errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Advertiser domain <span className="text-destructive">*</span></Label>
            <Input id="domain" placeholder="https://snoop.app" {...register("domain")} aria-invalid={!!errors.domain} errorTooltip={errors.domain?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Advertiser category <span className="text-destructive">*</span></Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <SelectComponent ref={field.ref} id="category" search placeholder="Select category" value={field.value}
                  onValueChange={field.onChange} ariaInvalid={!!errors.category} errorTooltip={errors.category?.message}
                  data={categories.map((c) => ({ name: c.value, value: c.id }))} />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appOs">App OS</Label>
            <Controller
              name="appOs"
              control={control}
              render={({ field }) => (
                <SelectComponent ref={field.ref} id="appOs" placeholder="No app" value={field.value || ""}
                  onValueChange={field.onChange}
                  data={[{ name: "Android", value: "android" }, { name: "iOS", value: "ios" }]} />
              )}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="appBundle">Advertiser app bundle</Label>
            <div className="relative flex items-center">
              <Input id="appBundle" placeholder={appOs ? "com.package.name / id1234567890" : "Pick the app OS first"}
                disabled={!appOs} {...register("appBundle")} className={appIcon || appLoading ? "pr-10" : ""} />
              {appLoading && <Loader2 className="absolute right-2.5 w-4 h-4 animate-spin text-muted-foreground" />}
              {!appLoading && appIcon && <img src={appIcon} alt="" className="absolute right-0 top-0 h-full w-9 rounded-md object-cover" />}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {appError ? "App not found in the store for this OS." : watch("appName") || "New campaigns for this advertiser start with this app."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternativeId">Alternative ID</Label>
            <Input id="alternativeId" placeholder="Your own reference" {...register("alternativeId")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={1} placeholder="Notes" {...register("notes")} />
          </div>
          {!scope.networkUser && (
            <Controller
              name="publisherCut"
              control={control}
              render={({ field }) => (
                <PublisherCutField id="publisherCut" value={field.value} onChange={field.onChange} level="advertiser"
                  inherited={isEdit ? adv?.networkPublisherCut : pickedNetworkCut} />
              )}
            />
          )}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2 h-9">
                  <Switch id="status" checked={field.value === "active"} onCheckedChange={(v) => field.onChange(v ? "active" : "paused")} />
                  <span className="text-sm">{field.value === "active" ? "Active" : "Paused — none of its campaigns bid"}</span>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Defaults</CardTitle>
          <CardDescription>New campaigns and line items for this advertiser start with these.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2 min-w-0">
            <Label>Default countries</Label>
            <Controller
              name="defaults.geo"
              control={control}
              render={({ field }) => (
                <MultiSelectComponent ref={field.ref} placeholder="All countries" values={field.value}
                  onValuesChange={field.onChange} className="w-full" data={geoData.map((g) => ({ name: g.name, value: g.value }))} />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultCurrency">Default currency</Label>
            <Controller
              name="defaults.currency"
              control={control}
              render={({ field }) => (
                <SelectComponent ref={field.ref} id="defaultCurrency" value={field.value} onValueChange={field.onChange}
                  data={currencyData.map((c) => ({ name: c.name, value: c.value }))} />
              )}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="clickUrl">Default click URL</Label>
            <Input id="clickUrl" placeholder="https://" {...register("defaults.clickUrl")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mmpPlatform">Default MMP</Label>
            <Controller
              name="defaults.mmpPlatform"
              control={control}
              render={({ field }) => (
                <SelectComponent ref={field.ref} id="mmpPlatform" value={field.value || ""} onValueChange={field.onChange} data={MmpPlatformData} />
              )}
            />
          </div>

          {PRESET_DEFAULTS.map((d) => (
            <div className="space-y-2" key={d.field}>
              <Label htmlFor={d.field}>{d.label}</Label>
              <Controller
                name={`defaults.${d.field}` as const}
                control={control}
                render={({ field }) => (
                  <PresetSelect id={d.field} kind={d.kind} advertiserId={id} value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          ))}
          <p className="md:col-span-3 -mt-2 text-[11px] text-muted-foreground">
            Presets prefill new campaigns and line items for this advertiser. Save presets from the campaign or line item form.
          </p>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-6 py-3 flex items-center gap-3 justify-end z-20">
        <Button type="button" variant="outline" onClick={() => navigate("/advertiser/list")} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save advertiser" : "Create advertiser"}</Button>
      </div>
    </form>
  );
};

export default AdvertiserForm;

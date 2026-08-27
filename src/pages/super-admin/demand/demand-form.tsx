import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, Server, Percent, Globe, Target, Settings2, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useDemandPartner, useCreateDemand, useUpdateDemand } from "@/query/useDemand";
import type { DemandPartner, DemandEndpoint } from "@/services/demand";

const KINDS = [
  { v: "dsp", l: "DSP — external demand" },
  { v: "ssp", l: "SSP — resell our supply" },
  { v: "exchange", l: "Exchange" },
  { v: "network", l: "Ad network" },
];
const INTEGRATIONS = [
  { v: "rtb", l: "RTB (OpenRTB S2S)" },
  { v: "vast", l: "VAST tag (video)" },
  { v: "passback", l: "Passback / redirect" },
  { v: "prebid", l: "Prebid adapter" },
  { v: "deal", l: "PMP / Deal" },
];
const PROTOCOLS = [
  { v: "openrtb-2.5", l: "OpenRTB 2.5" },
  { v: "openrtb-2.6", l: "OpenRTB 2.6" },
];
const AUTH_TYPES = [
  { v: "none", l: "None" },
  { v: "bearer", l: "Bearer token" },
  { v: "header", l: "Custom header" },
  { v: "query", l: "Query param" },
];
const AD_FORMATS = ["banner", "video", "native"];

const csvToArr = (s: string) => s.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);
const csvToRawArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const csvToNums = (s: string) => s.split(",").map((x) => Number(x.trim())).filter((n) => !Number.isNaN(n));
const arrToCsv = (a?: (string | number)[]) => (a || []).join(", ");

const emptyEndpoint = (): DemandEndpoint => ({ label: "", url: "", geos: [], tmaxMs: 200, priority: 0, qps: null });
const emptyPartner = (): Partial<DemandPartner> => ({
  name: "", partnerKind: "dsp", integration: "rtb", protocol: "openrtb-2.5", status: "paused",
  currency: "USD", seat: "",
  endpoints: [emptyEndpoint()],
  auth: { type: "none", headerName: "", value: "" },
  revenue: { marginPct: 15, minMarginCpm: null, bidAdjustPct: 0 },
  targeting: { geos: [], adFormats: [], deviceTypes: [], os: [], trafficType: "all", bundlesAllow: [], bundlesBlock: [], categoriesBlock: [] },
  limits: { qps: null, dailyReqCap: null, dailySpendCap: null, timeoutMs: 200 },
  sampling: { trafficPct: 100 },
  notifyWinUrl: true,
});

const Section: React.FC<{ icon: React.ReactNode; title: string; desc?: string; children: React.ReactNode }> = ({ icon, title, desc, children }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">{icon} {title}</CardTitle>
      {desc && <CardDescription>{desc}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

const DemandForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: loaded, isLoading } = useDemandPartner(id);
  const createMut = useCreateDemand();
  const updateMut = useUpdateDemand();

  const [form, setForm] = useState<Partial<DemandPartner>>(emptyPartner());

  useEffect(() => {
    if (isEdit && loaded?.data) setForm(JSON.parse(JSON.stringify(loaded.data)));
  }, [isEdit, loaded]);

  const setField = (path: string, value: any) =>
    setForm((prev) => {
      const next: any = { ...prev };
      const keys = path.split(".");
      let o = next;
      for (let i = 0; i < keys.length - 1; i++) { o[keys[i]] = { ...(o[keys[i]] || {}) }; o = o[keys[i]]; }
      o[keys[keys.length - 1]] = value;
      return next;
    });

  const setEndpoint = (idx: number, key: keyof DemandEndpoint, value: any) =>
    setForm((prev) => {
      const eps = [...(prev.endpoints || [])];
      eps[idx] = { ...eps[idx], [key]: value };
      return { ...prev, endpoints: eps };
    });
  const addEndpoint = () => setForm((prev) => ({ ...prev, endpoints: [...(prev.endpoints || []), emptyEndpoint()] }));
  const removeEndpoint = (idx: number) => setForm((prev) => ({ ...prev, endpoints: (prev.endpoints || []).filter((_, i) => i !== idx) }));

  const toggleFormat = (f: string) =>
    setForm((prev) => {
      const cur = prev.targeting?.adFormats || [];
      const next = cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f];
      return { ...prev, targeting: { ...(prev.targeting || {}), adFormats: next } };
    });

  const isRtb = form.integration === "rtb";
  const authType = form.auth?.type || "none";

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!form.name?.trim()) e.push("Partner name is required.");
    const eps = (form.endpoints || []).filter((x) => x.url?.trim());
    if (!eps.length) e.push("At least one endpoint with a URL is required.");
    return e;
  }, [form]);

  const save = () => {
    if (errors.length) return;
    const payload: Partial<DemandPartner> = {
      ...form,
      endpoints: (form.endpoints || []).filter((x) => x.url?.trim()),
    };
    const done = () => navigate("/super-admin/demand");
    if (isEdit) updateMut.mutate({ id: id as string, payload }, { onSuccess: done });
    else createMut.mutate(payload, { onSuccess: done });
  };

  const saving = createMut.isPending || updateMut.isPending;

  if (isEdit && isLoading) return <LoadingFallback />;

  return (
    <div className="space-y-5 pb-28 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/super-admin/demand")}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Server className="w-5 h-5 text-primary" /> {isEdit ? "Edit demand partner" : "New demand partner"}</h1>
          <p className="text-sm text-muted-foreground">Configure how the engine calls this partner and the margin (cut) you keep.</p>
        </div>
      </div>

      {/* Basics */}
      <Section icon={<Server className="w-4 h-4 text-primary" />} title="Basics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Partner name <span className="text-destructive">*</span></Label>
            <Input value={form.name || ""} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. PubMatic DSP" />
          </div>
          <div className="space-y-1.5">
            <Label>Kind</Label>
            <Select value={form.partnerKind} onValueChange={(v) => setField("partnerKind", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{KINDS.map((k) => <SelectItem key={k.v} value={k.v}>{k.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Integration</Label>
            <Select value={form.integration} onValueChange={(v) => setField("integration", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{INTEGRATIONS.map((k) => <SelectItem key={k.v} value={k.v}>{k.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {isRtb && (
            <div className="space-y-1.5">
              <Label>Protocol</Label>
              <Select value={form.protocol} onValueChange={(v) => setField("protocol", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROTOCOLS.map((k) => <SelectItem key={k.v} value={k.v}>{k.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Input value={form.currency || "USD"} onChange={(e) => setField("currency", e.target.value.toUpperCase())} />
          </div>
          <div className="space-y-1.5">
            <Label>Seat ID <span className="text-muted-foreground font-normal">(our seat at the partner)</span></Label>
            <Input value={form.seat || ""} onChange={(e) => setField("seat", e.target.value)} placeholder="optional" />
          </div>
          <div className="space-y-1.5 flex flex-col justify-end">
            <Label className="flex items-center justify-between border border-border/60 rounded-md px-3 h-9">Active
              <Switch checked={form.status === "active"} onCheckedChange={(v) => setField("status", v ? "active" : "paused")} />
            </Label>
          </div>
        </div>
      </Section>

      {/* Economics */}
      <Section icon={<Percent className="w-4 h-4 text-primary" />} title="Economics — your cut"
        desc="bidToSSP = winPrice × (1 − margin). Traffic % ramps how much eligible supply is sent while testing.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label>Margin %</Label>
            <Input type="number" min={0} max={100} value={form.revenue?.marginPct ?? 0} onChange={(e) => setField("revenue.marginPct", Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Min margin CPM</Label>
            <Input type="number" min={0} step="0.01" value={form.revenue?.minMarginCpm ?? ""} onChange={(e) => setField("revenue.minMarginCpm", e.target.value === "" ? null : Number(e.target.value))} placeholder="optional" />
          </div>
          <div className="space-y-1.5">
            <Label>Bid adjust %</Label>
            <Input type="number" value={form.revenue?.bidAdjustPct ?? 0} onChange={(e) => setField("revenue.bidAdjustPct", Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Traffic %</Label>
            <Input type="number" min={0} max={100} value={form.sampling?.trafficPct ?? 100} onChange={(e) => setField("sampling.trafficPct", Number(e.target.value))} />
          </div>
        </div>
      </Section>

      {/* Geo-wise endpoints */}
      <Section icon={<Globe className="w-4 h-4 text-primary" />} title="Endpoints (geo-wise)"
        desc="Add an endpoint per region. At bid time the engine picks the endpoint whose geos match the request country; an endpoint with no geos is the default (all).">
        <div className="space-y-3">
          {(form.endpoints || []).map((ep, i) => (
            <div key={i} className="rounded-lg border border-border/60 p-3 space-y-3 relative bg-muted/10">
              {(form.endpoints || []).length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="absolute top-1.5 right-1.5 h-7 w-7 text-destructive" onClick={() => removeEndpoint(i)}><Trash2 className="w-4 h-4" /></Button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Endpoint URL <span className="text-destructive">*</span></Label>
                  <Input placeholder="https://partner.com/rtb" value={ep.url} onChange={(e) => setEndpoint(i, "url", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Geos (comma-separated · empty = all)</Label>
                  <Input placeholder="US, CA" value={arrToCsv(ep.geos)} onChange={(e) => setEndpoint(i, "geos", csvToArr(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Label</Label>
                  <Input placeholder="US-East" value={ep.label || ""} onChange={(e) => setEndpoint(i, "label", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Timeout (ms)</Label>
                  <Input type="number" value={ep.tmaxMs ?? 200} onChange={(e) => setEndpoint(i, "tmaxMs", Number(e.target.value))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Priority</Label>
                    <Input type="number" value={ep.priority ?? 0} onChange={(e) => setEndpoint(i, "priority", Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">QPS cap</Label>
                    <Input type="number" value={ep.qps ?? ""} onChange={(e) => setEndpoint(i, "qps", e.target.value === "" ? null : Number(e.target.value))} placeholder="∞" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" className="gap-1.5" onClick={addEndpoint}><Plus className="w-4 h-4" /> Add endpoint</Button>
        </div>
      </Section>

      {/* Targeting */}
      <Section icon={<Target className="w-4 h-4 text-primary" />} title="Targeting — which supply to send">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Geos (country codes · empty = all)</Label>
            <Input placeholder="US, CA, IN" value={arrToCsv(form.targeting?.geos)} onChange={(e) => setField("targeting.geos", csvToArr(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Ad formats</Label>
            <div className="flex gap-4 h-9 items-center">
              {AD_FORMATS.map((f) => (
                <label key={f} className="flex items-center gap-1.5 text-sm capitalize cursor-pointer">
                  <input type="checkbox" checked={(form.targeting?.adFormats || []).includes(f)} onChange={() => toggleFormat(f)} /> {f}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Traffic type</Label>
            <Select value={form.targeting?.trafficType || "all"} onValueChange={(v) => setField("targeting.trafficType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">App + Web</SelectItem>
                <SelectItem value="app">App only</SelectItem>
                <SelectItem value="site">Web only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Device types <span className="text-muted-foreground font-normal">(OpenRTB · 3,7 = CTV)</span></Label>
            <Input placeholder="1, 4, 5" value={arrToCsv(form.targeting?.deviceTypes)} onChange={(e) => setField("targeting.deviceTypes", csvToNums(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>OS</Label>
            <Input placeholder="Android, iOS" value={arrToCsv(form.targeting?.os)} onChange={(e) => setField("targeting.os", csvToRawArr(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Bundles allow</Label>
            <Input placeholder="com.a.app, com.b.app" value={arrToCsv(form.targeting?.bundlesAllow)} onChange={(e) => setField("targeting.bundlesAllow", csvToRawArr(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Bundles block</Label>
            <Input placeholder="com.bad.app" value={arrToCsv(form.targeting?.bundlesBlock)} onChange={(e) => setField("targeting.bundlesBlock", csvToRawArr(e.target.value))} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Categories block <span className="text-muted-foreground font-normal">(IAB)</span></Label>
            <Input placeholder="IAB25, IAB26" value={arrToCsv(form.targeting?.categoriesBlock)} onChange={(e) => setField("targeting.categoriesBlock", csvToRawArr(e.target.value))} />
          </div>
        </div>
      </Section>

      {/* Auth (RTB) */}
      {isRtb && (
        <Section icon={<ShieldCheck className="w-4 h-4 text-primary" />} title="Authentication">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Auth type</Label>
              <Select value={authType} onValueChange={(v) => setField("auth.type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AUTH_TYPES.map((k) => <SelectItem key={k.v} value={k.v}>{k.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {(authType === "header" || authType === "query") && (
              <div className="space-y-1.5">
                <Label>{authType === "query" ? "Param name" : "Header name"}</Label>
                <Input value={form.auth?.headerName || ""} onChange={(e) => setField("auth.headerName", e.target.value)} placeholder={authType === "query" ? "apikey" : "X-Api-Key"} />
              </div>
            )}
            {authType !== "none" && (
              <div className="space-y-1.5">
                <Label>{authType === "bearer" ? "Token" : "Value"}</Label>
                <Input type="password" value={form.auth?.value || ""} onChange={(e) => setField("auth.value", e.target.value)} placeholder="secret" />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Ops / limits */}
      <Section icon={<Settings2 className="w-4 h-4 text-primary" />} title="Limits & operations">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label>Global QPS</Label>
            <Input type="number" value={form.limits?.qps ?? ""} onChange={(e) => setField("limits.qps", e.target.value === "" ? null : Number(e.target.value))} placeholder="∞" />
          </div>
          <div className="space-y-1.5">
            <Label>Daily req cap</Label>
            <Input type="number" value={form.limits?.dailyReqCap ?? ""} onChange={(e) => setField("limits.dailyReqCap", e.target.value === "" ? null : Number(e.target.value))} placeholder="∞" />
          </div>
          <div className="space-y-1.5">
            <Label>Daily spend cap</Label>
            <Input type="number" step="0.01" value={form.limits?.dailySpendCap ?? ""} onChange={(e) => setField("limits.dailySpendCap", e.target.value === "" ? null : Number(e.target.value))} placeholder="∞" />
          </div>
          <div className="space-y-1.5">
            <Label>Hard timeout (ms)</Label>
            <Input type="number" value={form.limits?.timeoutMs ?? 200} onChange={(e) => setField("limits.timeoutMs", Number(e.target.value))} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer pt-1">
          <Switch checked={!!form.notifyWinUrl} onCheckedChange={(v) => setField("notifyWinUrl", v)} />
          Fire the partner's win notification (nurl) on win — so they pay
        </label>
      </Section>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-6 py-3 flex items-center gap-3 justify-end z-20">
        {errors.length > 0 && <span className="text-xs text-destructive mr-auto">{errors[0]}</span>}
        <Button variant="outline" onClick={() => navigate("/super-admin/demand")}>Cancel</Button>
        <Button onClick={save} disabled={saving || errors.length > 0}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create partner"}</Button>
      </div>
    </div>
  );
};

export default DemandForm;

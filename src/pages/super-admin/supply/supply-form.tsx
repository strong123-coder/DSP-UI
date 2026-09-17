import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Plus, Trash2, Radio, Percent, Globe, MapPin, ShieldCheck, Handshake, Link2,
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
import { useSupplyPartner, useCreateSupply, useUpdateSupply } from "@/query/useSupply";
import type { SupplyPartner, SupplyZone } from "@/services/supply";
import type { PartnerEndpoint } from "@/services/mediation";
import { CommercialDealFields, DealTermsEditor } from "@/pages/super-admin/_shared/partner-fields";

const KINDS = [
  { v: "ssp", l: "SSP" },
  { v: "network", l: "Ad network" },
  { v: "publisher", l: "Publisher (direct)" },
  { v: "exchange", l: "Exchange" },
];
const FLOWS = [
  { v: "inbound", l: "Inbound — they call our /rtb?zone=" },
  { v: "outbound", l: "Outbound — we push supply to them" },
  { v: "both", l: "Both" },
];
const AUTH_TYPES = [
  { v: "none", l: "None" },
  { v: "bearer", l: "Bearer token" },
  { v: "header", l: "Custom header" },
  { v: "query", l: "Query param" },
];
const AD_FORMATS = ["banner", "video", "native"];

const csvToArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const csvToNums = (s: string) => s.split(",").map((x) => Number(x.trim())).filter((n) => !Number.isNaN(n));
const arrToCsv = (a?: (string | number)[]) => (a || []).join(", ");

const emptyZone = (): SupplyZone => ({ zoneId: "", name: "", status: "active", formats: [], sizes: [], deviceTypes: [], floorCpm: null });
const emptyEndpoint = (): PartnerEndpoint => ({ label: "", url: "", geos: [], tmaxMs: 200, priority: 0, qps: null });
const emptyPartner = (): Partial<SupplyPartner> => ({
  name: "", kind: "ssp", status: "paused", flow: "inbound", currency: "USD",
  inbound: { authToken: "", qps: null },
  outbound: { endpoints: [], auth: { type: "none", headerName: "", value: "" } },
  deal: { model: "revshare", revSharePct: 60, marginPct: 0, fixedCpm: null, bidAdjustPct: 0, floorCpm: null },
  zones: [emptyZone()],
  deals: [],
  supplyChain: { sellerId: "", sellerDomain: "", isDirect: true },
  limits: { dailyReqCap: null },
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

const SupplyForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: loaded, isLoading } = useSupplyPartner(id);
  const createMut = useCreateSupply();
  const updateMut = useUpdateSupply();

  const [form, setForm] = useState<Partial<SupplyPartner>>(emptyPartner());

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

  const setZone = (idx: number, patch: Partial<SupplyZone>) =>
    setForm((prev) => {
      const zs = [...(prev.zones || [])];
      zs[idx] = { ...zs[idx], ...patch };
      return { ...prev, zones: zs };
    });
  const addZone = () => setForm((prev) => ({ ...prev, zones: [...(prev.zones || []), emptyZone()] }));
  const removeZone = (idx: number) => setForm((prev) => ({ ...prev, zones: (prev.zones || []).filter((_, i) => i !== idx) }));

  const setEndpoint = (idx: number, key: keyof PartnerEndpoint, value: any) =>
    setForm((prev) => {
      const eps = [...(prev.outbound?.endpoints || [])];
      eps[idx] = { ...eps[idx], [key]: value };
      return { ...prev, outbound: { ...(prev.outbound || {}), endpoints: eps } };
    });
  const addEndpoint = () =>
    setForm((prev) => ({ ...prev, outbound: { ...(prev.outbound || {}), endpoints: [...(prev.outbound?.endpoints || []), emptyEndpoint()] } }));
  const removeEndpoint = (idx: number) =>
    setForm((prev) => ({ ...prev, outbound: { ...(prev.outbound || {}), endpoints: (prev.outbound?.endpoints || []).filter((_, i) => i !== idx) } }));

  const toggleZoneFormat = (idx: number, f: string) => {
    const cur = form.zones?.[idx]?.formats || [];
    setZone(idx, { formats: cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f] });
  };

  const flow = form.flow || "inbound";
  const hasInbound = flow === "inbound" || flow === "both";
  const hasOutbound = flow === "outbound" || flow === "both";
  const outAuthType = form.outbound?.auth?.type || "none";

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!form.name?.trim()) e.push("Partner name is required.");
    const zones = (form.zones || []).filter((z) => z.zoneId?.trim());
    if (!zones.length) e.push("At least one zone with a zone ID is required.");
    const badZone = zones.find((z) => !/^[a-zA-Z0-9_-]+$/.test(z.zoneId.trim()));
    if (badZone) e.push(`Zone ID "${badZone.zoneId}" may only contain letters, numbers, - and _.`);
    const ids = zones.map((z) => z.zoneId.trim());
    if (new Set(ids).size !== ids.length) e.push("Zone IDs must be unique.");
    if (hasOutbound && !(form.outbound?.endpoints || []).some((x) => x.url?.trim()))
      e.push("Outbound flow needs at least one endpoint URL.");
    if (form.deal?.model === "revshare" && (form.deal?.revSharePct === null || form.deal?.revSharePct === undefined))
      e.push("Rev share % is required for a rev-share deal.");
    if (form.deal?.model === "fixed" && (form.deal?.fixedCpm === null || form.deal?.fixedCpm === undefined))
      e.push("Fixed eCPM is required for a fixed-price deal.");
    return e;
  }, [form, hasOutbound]);

  const save = () => {
    if (errors.length) return;
    const payload: Partial<SupplyPartner> = {
      ...form,
      zones: (form.zones || []).filter((z) => z.zoneId?.trim()).map((z) => ({ ...z, zoneId: z.zoneId.trim() })),
      deals: (form.deals || []).filter((d) => d.dealId?.trim()),
      outbound: { ...(form.outbound || {}), endpoints: (form.outbound?.endpoints || []).filter((x) => x.url?.trim()) },
    };
    const done = () => navigate("/super-admin/supply");
    if (isEdit) updateMut.mutate({ id: id as string, payload }, { onSuccess: done });
    else createMut.mutate(payload, { onSuccess: done });
  };

  const saving = createMut.isPending || updateMut.isPending;

  if (isEdit && isLoading) return <LoadingFallback />;

  return (
    <div className="space-y-5 pb-28 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/super-admin/supply")}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Radio className="w-5 h-5 text-primary" /> {isEdit ? "Edit supply partner" : "New supply partner"}</h1>
          <p className="text-sm text-muted-foreground">Configure where traffic comes from or goes to, its zones, and the deal.</p>
        </div>
      </div>

      {/* Basics */}
      <Section icon={<Radio className="w-4 h-4 text-primary" />} title="Basics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Partner name <span className="text-destructive">*</span></Label>
            <Input value={form.name || ""} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Vertoz" />
          </div>
          <div className="space-y-1.5">
            <Label>Kind</Label>
            <Select value={form.kind} onValueChange={(v) => setField("kind", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{KINDS.map((k) => <SelectItem key={k.v} value={k.v}>{k.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Flow</Label>
            <Select value={flow} onValueChange={(v) => setField("flow", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{FLOWS.map((k) => <SelectItem key={k.v} value={k.v}>{k.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Input value={form.currency || "USD"} onChange={(e) => setField("currency", e.target.value.toUpperCase())} />
          </div>
          <div className="space-y-1.5 flex flex-col justify-end">
            <Label className="flex items-center justify-between border border-border/60 rounded-md px-3 h-9">Active
              <Switch checked={form.status === "active"} onCheckedChange={(v) => setField("status", v ? "active" : "paused")} />
            </Label>
          </div>
        </div>
      </Section>

      {/* Deal */}
      <Section icon={<Percent className="w-4 h-4 text-primary" />} title="Deal — the split"
        desc="Rev share: we keep the configured % of revenue and pay the partner the rest. Margin: the cut is taken in the price.">
        <CommercialDealFields deal={form.deal} onChange={(deal) => setField("deal", deal)} showFloor />
      </Section>

      {/* Zones */}
      <Section icon={<MapPin className="w-4 h-4 text-primary" />} title="Zones"
        desc="A zone is the unit of supply — the value in the engine's /rtb?zone= param. Zone IDs must be unique across all partners. Per-zone floor overrides the deal's default floor.">
        <div className="space-y-3">
          {(form.zones || []).map((z, i) => (
            <div key={i} className="rounded-lg border border-border/60 p-3 space-y-3 relative bg-muted/10">
              {(form.zones || []).length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="absolute top-1.5 right-1.5 h-7 w-7 text-destructive" onClick={() => removeZone(i)}><Trash2 className="w-4 h-4" /></Button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Zone ID <span className="text-destructive">*</span></Label>
                  <Input placeholder="vertoz_banner_us" value={z.zoneId} onChange={(e) => setZone(i, { zoneId: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input placeholder="optional" value={z.name || ""} onChange={(e) => setZone(i, { name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Floor CPM</Label>
                  <Input type="number" min={0} step="0.01" value={z.floorCpm ?? ""} placeholder="deal default"
                    onChange={(e) => setZone(i, { floorCpm: e.target.value === "" ? null : Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Formats (empty = all)</Label>
                  <div className="flex gap-3 h-9 items-center">
                    {AD_FORMATS.map((f) => (
                      <label key={f} className="flex items-center gap-1.5 text-sm capitalize cursor-pointer">
                        <input type="checkbox" checked={(z.formats || []).includes(f)} onChange={() => toggleZoneFormat(i, f)} /> {f}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sizes (WxH, comma-separated)</Label>
                  <Input placeholder="300x250, 1920x1080" value={arrToCsv(z.sizes)} onChange={(e) => setZone(i, { sizes: csvToArr(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Device types (3,7 = CTV)</Label>
                  <Input placeholder="empty = all" value={arrToCsv(z.deviceTypes)} onChange={(e) => setZone(i, { deviceTypes: csvToNums(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Zone status</Label>
                  <Select value={z.status || "active"} onValueChange={(v) => setZone(i, { status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" className="gap-1.5" onClick={addZone}><Plus className="w-4 h-4" /> Add zone</Button>
        </div>
      </Section>

      {/* Inbound */}
      {hasInbound && (
        <Section icon={<ShieldCheck className="w-4 h-4 text-primary" />} title="Inbound — they call us"
          desc="Authentication and throttle for requests this partner sends to our /rtb?zone= endpoint.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Auth token <span className="text-muted-foreground font-normal">(they must send this)</span></Label>
              <Input type="password" value={form.inbound?.authToken || ""} onChange={(e) => setField("inbound.authToken", e.target.value)} placeholder="optional (none = open)" />
            </div>
            <div className="space-y-1.5">
              <Label>Inbound QPS cap</Label>
              <Input type="number" value={form.inbound?.qps ?? ""} onChange={(e) => setField("inbound.qps", e.target.value === "" ? null : Number(e.target.value))} placeholder="∞" />
            </div>
          </div>
        </Section>
      )}

      {/* Outbound */}
      {hasOutbound && (
        <Section icon={<Globe className="w-4 h-4 text-primary" />} title="Outbound — we push supply to them"
          desc="Geo-wise endpoints we forward our supply to. The engine picks the endpoint whose geos match the request country.">
          <div className="space-y-3">
            {(form.outbound?.endpoints || []).map((ep, i) => (
              <div key={i} className="rounded-lg border border-border/60 p-3 space-y-3 relative bg-muted/10">
                <Button type="button" variant="ghost" size="icon" className="absolute top-1.5 right-1.5 h-7 w-7 text-destructive" onClick={() => removeEndpoint(i)}><Trash2 className="w-4 h-4" /></Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs">Endpoint URL <span className="text-destructive">*</span></Label>
                    <Input placeholder="https://ssp.example.com/rtb" value={ep.url} onChange={(e) => setEndpoint(i, "url", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Geos (comma-separated · empty = all)</Label>
                    <Input placeholder="US, CA" value={arrToCsv(ep.geos)}
                      onChange={(e) => setEndpoint(i, "geos", e.target.value.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Label</Label>
                    <Input placeholder="US-East" value={ep.label || ""} onChange={(e) => setEndpoint(i, "label", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Timeout (ms)</Label>
                    <Input type="number" value={ep.tmaxMs ?? 200} onChange={(e) => setEndpoint(i, "tmaxMs", Number(e.target.value))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">QPS cap</Label>
                    <Input type="number" value={ep.qps ?? ""} onChange={(e) => setEndpoint(i, "qps", e.target.value === "" ? null : Number(e.target.value))} placeholder="∞" />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" className="gap-1.5" onClick={addEndpoint}><Plus className="w-4 h-4" /> Add endpoint</Button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label>Outbound auth</Label>
                <Select value={outAuthType} onValueChange={(v) => setField("outbound.auth.type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AUTH_TYPES.map((k) => <SelectItem key={k.v} value={k.v}>{k.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {(outAuthType === "header" || outAuthType === "query") && (
                <div className="space-y-1.5">
                  <Label>{outAuthType === "query" ? "Param name" : "Header name"}</Label>
                  <Input value={form.outbound?.auth?.headerName || ""} onChange={(e) => setField("outbound.auth.headerName", e.target.value)} placeholder={outAuthType === "query" ? "apikey" : "X-Api-Key"} />
                </div>
              )}
              {outAuthType !== "none" && (
                <div className="space-y-1.5">
                  <Label>{outAuthType === "bearer" ? "Token" : "Value"}</Label>
                  <Input type="password" value={form.outbound?.auth?.value || ""} onChange={(e) => setField("outbound.auth.value", e.target.value)} placeholder="secret" />
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* PMP deals */}
      <Section icon={<Handshake className="w-4 h-4 text-primary" />} title="Deals (PMP)"
        desc="OpenRTB Deal IDs arranged with this supply — matched against inbound imp.pmp.deals; our winning bids answer with bid.dealid.">
        <DealTermsEditor deals={form.deals} onChange={(deals) => setField("deals", deals)} />
      </Section>

      {/* Supply chain + limits */}
      <Section icon={<Link2 className="w-4 h-4 text-primary" />} title="Supply chain & limits"
        desc="schain / sellers.json identity (used later when we forward supply), and safety caps.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Seller ID</Label>
            <Input value={form.supplyChain?.sellerId || ""} onChange={(e) => setField("supplyChain.sellerId", e.target.value)} placeholder="optional" />
          </div>
          <div className="space-y-1.5">
            <Label>Seller domain</Label>
            <Input value={form.supplyChain?.sellerDomain || ""} onChange={(e) => setField("supplyChain.sellerDomain", e.target.value)} placeholder="partner.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Daily request cap</Label>
            <Input type="number" value={form.limits?.dailyReqCap ?? ""} onChange={(e) => setField("limits.dailyReqCap", e.target.value === "" ? null : Number(e.target.value))} placeholder="∞" />
          </div>
          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="flex items-center gap-2 text-sm cursor-pointer h-9">
              <Switch checked={form.supplyChain?.isDirect !== false} onCheckedChange={(v) => setField("supplyChain.isDirect", v)} />
              Direct relationship (no intermediary)
            </label>
          </div>
        </div>
      </Section>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-6 py-3 flex items-center gap-3 justify-end z-20">
        {errors.length > 0 && <span className="text-xs text-destructive mr-auto">{errors[0]}</span>}
        <Button variant="outline" onClick={() => navigate("/super-admin/supply")}>Cancel</Button>
        <Button onClick={save} disabled={saving || errors.length > 0}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create partner"}</Button>
      </div>
    </div>
  );
};

export default SupplyForm;

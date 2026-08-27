import React, { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Search, Server, Percent, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose,
} from "@/components/ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import {
  useDemandList, useCreateDemand, useUpdateDemand, useDemandStatus, useDeleteDemand,
} from "@/query/useDemand";
import type { DemandPartner, DemandEndpoint } from "@/services/demand";

const KINDS = [
  { v: "dsp", l: "DSP (external demand)" },
  { v: "ssp", l: "SSP (resell supply)" },
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
const AD_FORMATS = ["banner", "video", "native"];
const csvToArr = (s: string) => s.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);
const arrToCsv = (a?: string[]) => (a || []).join(", ");

const emptyEndpoint = (): DemandEndpoint => ({ label: "", url: "", geos: [], tmaxMs: 200, priority: 0 });
const emptyPartner = (): Partial<DemandPartner> => ({
  name: "", partnerKind: "dsp", integration: "rtb", status: "paused", currency: "USD",
  endpoints: [emptyEndpoint()],
  revenue: { marginPct: 15, bidAdjustPct: 0 },
  targeting: { geos: [], adFormats: [], trafficType: "all" },
  sampling: { trafficPct: 100 },
  notifyWinUrl: true,
});

const DemandPartners: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const listPayload = useMemo(
    () => ({ page, limit, search: search || undefined, status: statusFilter === "all" ? undefined : statusFilter }),
    [page, limit, search, statusFilter],
  );
  const { data: resp, isLoading } = useDemandList(listPayload);
  const rows: DemandPartner[] = resp?.data?.data ?? [];
  const pagination = resp?.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const createMut = useCreateDemand();
  const updateMut = useUpdateDemand();
  const statusMut = useDemandStatus();
  const deleteMut = useDeleteDemand();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<DemandPartner>>(emptyPartner());

  const openAdd = () => { setEditId(null); setForm(emptyPartner()); setOpen(true); };
  const openEdit = (p: DemandPartner) => {
    setEditId(p._id || null);
    setForm(JSON.parse(JSON.stringify(p)));
    setOpen(true);
  };

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
  const removeEndpoint = (idx: number) =>
    setForm((prev) => ({ ...prev, endpoints: (prev.endpoints || []).filter((_, i) => i !== idx) }));

  const toggleFormat = (f: string) =>
    setForm((prev) => {
      const cur = prev.targeting?.adFormats || [];
      const next = cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f];
      return { ...prev, targeting: { ...(prev.targeting || {}), adFormats: next } };
    });

  const save = () => {
    // Build a clean payload (endpoints must have a url).
    const payload: Partial<DemandPartner> = {
      ...form,
      endpoints: (form.endpoints || []).filter((e) => e.url && e.url.trim()),
    };
    if (!payload.name?.trim()) return;
    if (!payload.endpoints?.length) return;
    const done = () => setOpen(false);
    if (editId) updateMut.mutate({ id: editId, payload }, { onSuccess: done });
    else createMut.mutate(payload, { onSuccess: done });
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Server className="w-5 h-5 text-primary" /> Demand Partners</h1>
          <p className="text-sm text-muted-foreground">
            External DSP / SSP / exchange endpoints the engine calls per impression. Set geo-wise endpoints and your margin (cut).
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5"><Plus className="w-4 h-4" /> Add partner</Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search partners…" className="pl-9" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && rows.length === 0 ? (
        <LoadingFallback />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-5">Partner</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Integration</TableHead>
                  <TableHead>Endpoints / Geos</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No demand partners yet.</TableCell></TableRow>
                ) : rows.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="pl-5 font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="uppercase text-[10px]">{p.partnerKind}</Badge></TableCell>
                    <TableCell className="uppercase text-xs">{p.integration}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Globe className="w-3 h-3" />{p.endpoints?.length || 0} endpoint(s)</div>
                      <div className="truncate max-w-[220px]">{(p.targeting?.geos?.length ? p.targeting.geos : ["all geos"]).join(", ")}</div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{p.revenue?.marginPct ?? 0}%</TableCell>
                    <TableCell>
                      <Switch checked={p.status === "active"}
                        onCheckedChange={(v) => statusMut.mutate({ id: p._id!, status: v ? "active" : "paused" })} />
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                        onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteMut.mutate(p._id!); }}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {rows.length > 0 && (
        <ThreeButtonPagination page={page} setPage={setPage} totalPages={totalPages} limit={limit} setLimit={setLimit} />
      )}

      {/* Add / Edit drawer */}
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerContent className="max-w-lg w-full ml-auto h-full flex flex-col">
          <DrawerHeader className="border-b border-border/40">
            <DrawerTitle>{editId ? "Edit demand partner" : "Add demand partner"}</DrawerTitle>
            <DrawerDescription>Configure how the engine calls this partner and your margin.</DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Basics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Partner name *</Label>
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
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Input value={form.currency || "USD"} onChange={(e) => setField("currency", e.target.value.toUpperCase())} />
              </div>
              <div className="space-y-1.5 flex flex-col justify-end">
                <Label className="flex items-center justify-between">Active
                  <Switch checked={form.status === "active"} onCheckedChange={(v) => setField("status", v ? "active" : "paused")} />
                </Label>
              </div>
            </div>

            {/* Economics */}
            <div className="rounded-xl border border-border/60 p-3 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-1.5"><Percent className="w-4 h-4 text-primary" /> Your margin (cut)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Margin %</Label>
                  <Input type="number" min={0} max={100} value={form.revenue?.marginPct ?? 0}
                    onChange={(e) => setField("revenue.marginPct", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bid adjust %</Label>
                  <Input type="number" value={form.revenue?.bidAdjustPct ?? 0}
                    onChange={(e) => setField("revenue.bidAdjustPct", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Traffic %</Label>
                  <Input type="number" min={0} max={100} value={form.sampling?.trafficPct ?? 100}
                    onChange={(e) => setField("sampling.trafficPct", Number(e.target.value))} />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">bidToSSP = winPrice × (1 − margin). Traffic % ramps how much of eligible supply is sent while testing.</p>
            </div>

            {/* Targeting */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Targeting — which supply to send</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Geos (country codes, comma-separated — empty = all)</Label>
                <Input placeholder="US, CA, IN" value={arrToCsv(form.targeting?.geos)}
                  onChange={(e) => setField("targeting.geos", csvToArr(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ad formats</Label>
                <div className="flex gap-3">
                  {AD_FORMATS.map((f) => (
                    <label key={f} className="flex items-center gap-1.5 text-sm capitalize cursor-pointer">
                      <input type="checkbox" checked={(form.targeting?.adFormats || []).includes(f)} onChange={() => toggleFormat(f)} />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Traffic type</Label>
                <Select value={form.targeting?.trafficType || "all"} onValueChange={(v) => setField("targeting.trafficType", v)}>
                  <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">App + Web</SelectItem>
                    <SelectItem value="app">App only</SelectItem>
                    <SelectItem value="site">Web only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Geo-wise endpoints */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary" /> Endpoints (geo-wise)</p>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addEndpoint}><Plus className="w-3.5 h-3.5" /> Add endpoint</Button>
              </div>
              {(form.endpoints || []).map((ep, i) => (
                <div key={i} className="rounded-lg border border-border/60 p-3 space-y-2 relative">
                  {(form.endpoints || []).length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive"
                      onClick={() => removeEndpoint(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">Endpoint URL *</Label>
                      <Input placeholder="https://partner.com/rtb" value={ep.url} onChange={(e) => setEndpoint(i, "url", e.target.value)} />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">Geos for this endpoint (empty = default/all)</Label>
                      <Input placeholder="US, CA" value={arrToCsv(ep.geos)} onChange={(e) => setEndpoint(i, "geos", csvToArr(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input placeholder="US-East" value={ep.label || ""} onChange={(e) => setEndpoint(i, "label", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Timeout (ms)</Label>
                      <Input type="number" value={ep.tmaxMs ?? 200} onChange={(e) => setEndpoint(i, "tmaxMs", Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DrawerFooter className="border-t border-border/40 flex-row gap-2">
            <Button className="flex-1" onClick={save} disabled={saving}>{saving ? "Saving…" : editId ? "Save changes" : "Create partner"}</Button>
            <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default DemandPartners;

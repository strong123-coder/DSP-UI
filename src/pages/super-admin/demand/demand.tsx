import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, Search, Server, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useDemandList, useDemandStatus, useDeleteDemand } from "@/query/useDemand";
import type { DemandPartner } from "@/services/demand";

const DemandPartners: React.FC = () => {
  const navigate = useNavigate();
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

  const statusMut = useDemandStatus();
  const deleteMut = useDeleteDemand();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Server className="w-5 h-5 text-primary" /> Demand Partners</h1>
          <p className="text-sm text-muted-foreground">
            External DSP / exchange endpoints the engine calls for bids. Set geo-wise endpoints and the deal (rev share or margin).
          </p>
        </div>
        <Button onClick={() => navigate("/super-admin/demand/new")} className="gap-1.5"><Plus className="w-4 h-4" /> Add partner</Button>
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
                  <TableHead className="text-right">Deal</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No demand partners yet. Click <b>Add partner</b> to create one.
                  </TableCell></TableRow>
                ) : rows.map((p) => (
                  <TableRow key={p._id} className="cursor-pointer hover:bg-muted/20"
                    onClick={() => navigate(`/super-admin/demand/${p._id}/edit`)}>
                    <TableCell className="pl-5 font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="uppercase text-[10px]">{p.kind}</Badge></TableCell>
                    <TableCell className="uppercase text-xs">{p.integration}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Globe className="w-3 h-3" />{p.endpoints?.length || 0} endpoint(s)</div>
                      <div className="truncate max-w-[220px]">{(p.targeting?.geos?.length ? p.targeting.geos : ["all geos"]).join(", ")}</div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {p.deal?.model === "fixed"
                        ? `$${p.deal?.fixedCpm ?? 0} fixed eCPM`
                        : p.deal?.model === "revshare"
                        ? `${p.deal?.revSharePct ?? 0}% rev share`
                        : `${p.deal?.marginPct ?? 0}% margin`}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Switch checked={p.status === "active"}
                        onCheckedChange={(v) => statusMut.mutate({ id: p._id!, status: v ? "active" : "paused" })} />
                    </TableCell>
                    <TableCell className="text-right pr-5" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/super-admin/demand/${p._id}/edit`)}><Pencil className="w-4 h-4" /></Button>
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
    </div>
  );
};

export default DemandPartners;

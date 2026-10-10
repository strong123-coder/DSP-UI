import React, { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Ban, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import {
  useMcpCampaignDecision, useMcpReviewCampaigns, useMcpReviewServers, useMcpServerDecision,
} from "@/query/useMcpPublisher";
import type { McpServer } from "@/services/mcpPublisher";
import { StatusBadge } from "@/pages/supply/_shared";

type Decision = "approve" | "reject" | "suspend";
interface Pending {
  kind: "server" | "campaign";
  id: string;
  name: string;
  decision: Decision;
  revShare?: number;
}

const SponsoredPreview: React.FC<{ c: any }> = ({ c }) => (
  <div className="text-xs leading-relaxed rounded-md border border-border bg-muted/20 p-2 max-w-[340px]">
    <div className="text-muted-foreground">Sponsored · {c?.advertiser}</div>
    <div className="font-semibold">{c?.title}</div>
    <div>{c?.description}</div>
    <div className="text-primary">{c?.cta || "Learn more"} ({c?.displayDomain})</div>
  </div>
);

const McpReview: React.FC = () => {
  const [tab, setTab] = useState<"servers" | "campaigns">("servers");
  const [serverStatus, setServerStatus] = useState("in_review");
  const [reviewStatus, setReviewStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pending, setPending] = useState<Pending | null>(null);
  const [notes, setNotes] = useState("");

  const sParams = useMemo(() => ({ page, limit, status: serverStatus }), [page, limit, serverStatus]);
  const cParams = useMemo(() => ({ page, limit, reviewStatus }), [page, limit, reviewStatus]);
  const servers = useMcpReviewServers(sParams);
  const campaigns = useMcpReviewCampaigns(cParams);
  const serverMut = useMcpServerDecision();
  const campaignMut = useMcpCampaignDecision();

  const active = tab === "servers" ? servers : campaigns;
  const rows: any[] = active.data?.data?.data ?? [];
  const totalPages = active.data?.data?.pagination?.totalPages || 1;

  const open = (p: Pending) => {
    setNotes("");
    setPending(p);
  };

  const confirm = () => {
    if (!pending) return;
    const done = { onSuccess: () => setPending(null) };
    if (pending.kind === "server") {
      serverMut.mutate({ id: pending.id, decision: pending.decision, notes: notes || undefined, revShare: pending.revShare }, done);
    } else {
      campaignMut.mutate({ id: pending.id, decision: pending.decision, notes: notes || undefined }, done);
    }
  };

  const needsNotes = pending?.decision === "reject" || pending?.decision === "suspend";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> MCP Review</h1>
        <p className="text-sm text-muted-foreground">
          Approve publisher MCP servers before their live keys fill, and approve MCP ad copy before it serves.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
          {(["servers", "campaigns"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`px-4 py-1.5 text-sm rounded-md font-medium ${tab === t ? "bg-background shadow-sm" : "text-muted-foreground"}`}
            >
              {t === "servers" ? "MCP servers" : "Ad creatives"}
            </button>
          ))}
        </div>
        {tab === "servers" ? (
          <Select value={serverStatus} onValueChange={(v) => { setServerStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["in_review", "live", "paused", "rejected", "suspended", "draft"].map((s) => (
                <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select value={reviewStatus} onValueChange={(v) => { setReviewStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["pending", "approved", "rejected"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {active.isLoading && rows.length === 0 ? (
        <LoadingFallback />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            {tab === "servers" ? (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-5">Server</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Placements / tools</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Share</TableHead>
                    <TableHead className="text-right pr-5">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nothing here.</TableCell></TableRow>
                  ) : (
                    rows.map((s: McpServer) => (
                      <TableRow key={s._id}>
                        <TableCell className="pl-5 max-w-[280px]">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{s.description}</div>
                          {s.homepage && (
                            <a href={s.homepage} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1">
                              {s.homepage} <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{s.categories.join(", ")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[220px]">
                          {s.placements.map((p) => (
                            <div key={p.key}><b className="text-foreground">{p.key}</b>: {p.toolAllowlist.length ? p.toolAllowlist.join(", ") : "all tools"}</div>
                          ))}
                          {s.blockedHosts.length > 0 && <div>Blocked hosts: {s.blockedHosts.join(", ")}</div>}
                        </TableCell>
                        <TableCell><StatusBadge status={s.status} /></TableCell>
                        <TableCell className="text-xs">{Math.round((s.revShare ?? 0.7) * 100)}%</TableCell>
                        <TableCell className="text-right pr-5 whitespace-nowrap">
                          {(s.status === "in_review" || s.status === "suspended") && (
                            <Button size="sm" variant="ghost" className="text-emerald-700 gap-1" onClick={() => open({ kind: "server", id: s._id!, name: s.name, decision: "approve", revShare: s.revShare ?? 0.7 })}>
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </Button>
                          )}
                          {s.status === "in_review" && (
                            <Button size="sm" variant="ghost" className="text-destructive gap-1" onClick={() => open({ kind: "server", id: s._id!, name: s.name, decision: "reject" })}>
                              <XCircle className="w-4 h-4" /> Reject
                            </Button>
                          )}
                          {(s.status === "live" || s.status === "paused") && (
                            <Button size="sm" variant="ghost" className="text-destructive gap-1" onClick={() => open({ kind: "server", id: s._id!, name: s.name, decision: "suspend" })}>
                              <Ban className="w-4 h-4" /> Suspend
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-5">Campaign</TableHead>
                    <TableHead>Ad preview</TableHead>
                    <TableHead>Landing page</TableHead>
                    <TableHead>Targeting</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead className="text-right pr-5">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nothing here.</TableCell></TableRow>
                  ) : (
                    rows.map((c: any) => (
                      <TableRow key={c._id}>
                        <TableCell className="pl-5">
                          <div className="font-medium">{c.title}</div>
                          <div className="text-xs text-muted-foreground">${c.mcp?.bid} CPC · {c.status}</div>
                        </TableCell>
                        <TableCell><SponsoredPreview c={c.mcp?.creative} /></TableCell>
                        <TableCell className="text-xs max-w-[200px] break-all">
                          <a href={c.mcp?.creative?.destinationUrl} target="_blank" rel="noreferrer" className="text-primary">
                            {c.mcp?.creative?.destinationUrl}
                          </a>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[180px]">
                          {c.mcp?.categories?.join(", ")}
                          {c.mcp?.keywords?.length > 0 && <div>kw: {c.mcp.keywords.join(", ")}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{c.mcp?.reviewStatus}</Badge>
                          {c.mcp?.reviewNotes && <div className="text-[11px] text-muted-foreground mt-1 max-w-[160px]">{c.mcp.reviewNotes}</div>}
                        </TableCell>
                        <TableCell className="text-right pr-5 whitespace-nowrap">
                          {c.mcp?.reviewStatus !== "approved" && (
                            <Button size="sm" variant="ghost" className="text-emerald-700 gap-1" onClick={() => open({ kind: "campaign", id: c._id, name: c.title, decision: "approve" })}>
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </Button>
                          )}
                          {c.mcp?.reviewStatus !== "rejected" && (
                            <Button size="sm" variant="ghost" className="text-destructive gap-1" onClick={() => open({ kind: "campaign", id: c._id, name: c.title, decision: "reject" })}>
                              <XCircle className="w-4 h-4" /> Reject
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      )}

      {rows.length > 0 && (
        <ThreeButtonPagination page={page} setPage={setPage} totalPages={totalPages} limit={limit} setLimit={setLimit} />
      )}

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span className="capitalize">{pending?.decision}</span> “{pending?.name}”
            </DialogTitle>
            <DialogDescription>
              {pending?.kind === "server"
                ? pending?.decision === "approve"
                  ? "Live keys for this server start filling within seconds."
                  : pending?.decision === "suspend"
                    ? "Ads stop immediately. Only a super admin can reinstate it."
                    : "The publisher sees your notes and can resubmit."
                : pending?.decision === "approve"
                  ? "This ad copy can serve on MCP servers right away."
                  : "The ad stops serving; the advertiser sees your notes."}
            </DialogDescription>
          </DialogHeader>
          {pending?.kind === "server" && pending.decision === "approve" && (
            <div className="space-y-1.5">
              <Label htmlFor="revShare">Publisher revenue share (%)</Label>
              <Input
                id="revShare"
                type="number"
                min={0}
                max={100}
                value={Math.round((pending.revShare ?? 0.7) * 100)}
                onChange={(e) => setPending({ ...pending, revShare: Math.min(100, Math.max(0, Number(e.target.value))) / 100 })}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes {needsNotes ? "(required)" : "(optional)"}</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={needsNotes ? "What needs to change?" : ""} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>Cancel</Button>
            <Button
              variant={pending?.decision === "approve" ? "default" : "destructive"}
              disabled={(needsNotes && !notes.trim()) || serverMut.isPending || campaignMut.isPending}
              onClick={confirm}
              className="capitalize"
            >
              {pending?.decision}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default McpReview;

import React, { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Ban, Sparkles, ExternalLink, Settings2 } from "lucide-react";
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
import McpCampaignDialog from "./mcp-campaign-dialog";

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
  const [editing, setEditing] = useState<any | null>(null);

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
          Approve publisher MCP servers, and set up + approve the MCP ad for campaigns advertisers opted in.
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
              {t === "servers" ? "MCP servers" : "Campaigns"}
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
                    <TableHead>Existing creative</TableHead>
                    <TableHead>CTA link</TableHead>
                    <TableHead>MCP ad</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead className="text-right pr-5">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No campaigns opted in to MCP here.</TableCell></TableRow>
                  ) : (
                    rows.map((c: any) => (
                      <TableRow key={c._id}>
                        <TableCell className="pl-5">
                          <div className="font-medium">{c.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {c.orgName || c.orgId} · <span className="uppercase">{c.type}</span> · {c.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.suggestedMcp?.creative?.imageUrl ? (
                            <img src={c.suggestedMcp.creative.imageUrl} alt="" className="h-12 w-20 object-cover rounded border border-border" />
                          ) : (
                            <span className="text-xs text-muted-foreground">No image</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate" title={c.ctaUrl}>{c.ctaUrl || "—"}</TableCell>
                        <TableCell>
                          {c.mcp?.creative?.title ? (
                            <SponsoredPreview c={c.mcp.creative} />
                          ) : (
                            <span className="text-xs text-muted-foreground">Not configured</span>
                          )}
                          {c.mcp?.bid ? <div className="text-[11px] text-muted-foreground mt-1">${c.mcp.bid} CPC</div> : null}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{c.mcp?.reviewStatus || "pending"}</Badge>
                          {c.mcp?.reviewNotes && <div className="text-[11px] text-muted-foreground mt-1 max-w-[160px]">{c.mcp.reviewNotes}</div>}
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <Button size="sm" className="gap-1" onClick={() => setEditing(c)}>
                            <Settings2 className="w-4 h-4" /> {c.mcp?.reviewStatus === "approved" ? "Edit" : "Configure"}
                          </Button>
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

      <McpCampaignDialog campaign={editing} onClose={() => setEditing(null)} />

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

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Pencil, Send, Pause, Play, Trash2, KeyRound, Plug, Settings2, AlertTriangle, Plus, ShieldAlert, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingFallback from "@/components/ui/loading-fallback";
import {
  useCreateMcpKey, useDeleteMcpServer, useMcpCategories, useMcpIntegration, useMcpKeys, useMcpServer,
  useMcpServerStatus, useRevokeMcpKey, useSubmitMcpServer,
} from "@/query/useMcpPublisher";
import type { McpApiKey, McpCategory, McpIntegration, McpServer } from "@/services/mcpPublisher";
import { CodeBlock, CopyButton, Section, StatusBadge, STATUS_META, categoryLabel } from "../_shared";

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

const McpServerDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: sResp, isLoading } = useMcpServer(id);
  const { data: kResp } = useMcpKeys(id);
  const { data: iResp } = useMcpIntegration(id);
  const { data: catResp } = useMcpCategories();

  const submitMut = useSubmitMcpServer();
  const statusMut = useMcpServerStatus();
  const deleteMut = useDeleteMcpServer();
  const createKeyMut = useCreateMcpKey();
  const revokeMut = useRevokeMcpKey();

  const [newKeyMode, setNewKeyMode] = useState<"test" | "live" | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [revealed, setRevealed] = useState<McpApiKey | null>(null);

  if (isLoading || !sResp?.data?.data) return <LoadingFallback />;

  const server: McpServer = sResp.data.data;
  const keys: McpApiKey[] = kResp?.data?.data ?? [];
  const integ: McpIntegration | undefined = iResp?.data?.data;
  const categories: McpCategory[] = catResp?.data?.data?.categories ?? [];
  const status = server.status ?? "draft";
  const activeKeys = keys.filter((k) => k.status === "active");

  const createKey = () => {
    if (!newKeyMode) return;
    createKeyMut.mutate(
      { id: id!, mode: newKeyMode, label: newKeyLabel || undefined },
      {
        onSuccess: (r: any) => {
          setRevealed(r?.data?.data);
          setNewKeyMode(null);
          setNewKeyLabel("");
        },
      },
    );
  };

  const envBlock = integ
    ? `MKTOOL_ENDPOINT=${integ.bidderUrl}\nMKTOOL_API_KEY=${activeKeys[0]?.prefix ?? "mk_test_"}…   # paste the full key you copied\nMKTOOL_SESSION_SALT=<random 32+ char secret>`
    : "";

  return (
    <div className="space-y-5 max-w-5xl pb-10">
      <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate("/supply/servers")}>
        <ArrowLeft className="w-4 h-4" /> All servers
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{server.name}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">{STATUS_META[status].hint}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(status === "draft" || status === "rejected") && (
            <Button className="gap-1.5" disabled={submitMut.isPending} onClick={() => submitMut.mutate(id!)}>
              <Send className="w-4 h-4" /> Submit for review
            </Button>
          )}
          {status === "live" && (
            <Button variant="outline" className="gap-1.5" onClick={() => statusMut.mutate({ id: id!, status: "paused" })}>
              <Pause className="w-4 h-4" /> Pause ads
            </Button>
          )}
          {status === "paused" && (
            <Button className="gap-1.5" onClick={() => statusMut.mutate({ id: id!, status: "live" })}>
              <Play className="w-4 h-4" /> Resume ads
            </Button>
          )}
          {status !== "in_review" && status !== "suspended" && (
            <Button variant="outline" className="gap-1.5" onClick={() => navigate(`/supply/servers/${id}/edit`)}>
              <Pencil className="w-4 h-4" /> Edit
            </Button>
          )}
          <Button
            variant="ghost"
            className="gap-1.5 text-destructive"
            onClick={() => {
              if (confirm(`Delete "${server.name}"? All its keys stop working immediately.`)) {
                deleteMut.mutate(id!, { onSuccess: () => navigate("/supply/servers") });
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {server.reviewNotes && (status === "rejected" || status === "suspended") && (
        <div className="rounded-lg border border-red-300 bg-red-50 text-red-900 text-sm p-3 flex gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <div><b>Review notes:</b> {server.reviewNotes}</div>
        </div>
      )}

      {/* Keys */}
      <Section
        icon={<KeyRound className="w-4 h-4 text-primary" />}
        title="1. API keys"
        desc={
          <>
            <b>Test</b> keys return a test ad right away and are never billed. <b>Live</b> keys fill real
            campaigns once this server is approved. Keep keys server-side.
          </>
        }
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setNewKeyMode("test")}>
              <Plus className="w-4 h-4" /> Test key
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setNewKeyMode("live")}>
              <Plus className="w-4 h-4" /> Live key
            </Button>
          </div>
        }
      >
        {keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No keys yet. Start with a test key.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k._id} className={k.status === "revoked" ? "opacity-50" : ""}>
                  <TableCell><code className="text-xs">{k.prefix}…</code></TableCell>
                  <TableCell>
                    <Badge variant={k.mode === "live" ? "default" : "secondary"} className="uppercase text-[10px]">{k.mode}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{k.label || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fmtDate(k.createdAt)}</TableCell>
                  <TableCell className="text-xs capitalize">{k.status}</TableCell>
                  <TableCell className="text-right">
                    {k.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm(`Revoke ${k.prefix}…? Servers using it stop getting ads immediately.`)) {
                            revokeMut.mutate({ id: id!, keyId: k._id });
                          }
                        }}
                      >
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {status !== "live" && activeKeys.some((k) => k.mode === "live") && (
          <p className="text-xs text-amber-700 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Live keys return no ads until this server is approved and live.
          </p>
        )}
      </Section>

      {/* Integration */}
      {integ && (
        <Section
          icon={<Plug className="w-4 h-4 text-primary" />}
          title="2. Integrate"
          desc="Your MCP server calls our bidder over HTTPS. Add these environment variables and one option to your server."
          action={
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate("/supply/guide")}>
              <BookOpen className="w-4 h-4" /> Full guide
            </Button>
          }
        >
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3 space-y-1">
              <Label className="text-xs text-muted-foreground">Bidder URL</Label>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm break-all">{integ.bidderUrl}</code>
                <CopyButton text={integ.bidderUrl} />
              </div>
            </div>
            <div className="rounded-lg border border-border p-3 space-y-1">
              <Label className="text-xs text-muted-foreground">Ad request endpoint</Label>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs break-all">POST {integ.endpoints.select}</code>
                <CopyButton text={integ.endpoints.select} />
              </div>
            </div>
          </div>
          <CodeBlock title=".env" code={envBlock} />
          <CodeBlock title="Install (Go)" code={integ.sdk.go.install} />
          <CodeBlock title="main.go" code={integ.sdk.go.snippet} />
        </Section>
      )}

      {/* Config summary */}
      <Section
        icon={<Settings2 className="w-4 h-4 text-primary" />}
        title="3. Configuration"
        desc={`Your share of net revenue: ${Math.round((server.revShare ?? 0.7) * 100)}%`}
      >
        <dl className="grid md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Categories</dt>
            <dd>{server.categories.map((c) => categoryLabel(categories, c)).join(", ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Blocked categories</dt>
            <dd>{server.blockedCategories.map((c) => categoryLabel(categories, c)).join(", ") || "None"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Blocked AI hosts</dt>
            <dd>{server.blockedHosts.join(", ") || "None"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Blocked advertiser domains</dt>
            <dd>{server.blockedAdvertiserDomains.join(", ") || "None"}</dd>
          </div>
        </dl>
        <div className="space-y-2">
          {server.placements.map((p) => (
            <div key={p.key} className="rounded-lg border border-border p-3 text-sm flex flex-wrap gap-x-6 gap-y-1">
              <span><b>{p.key}</b> {p.status === "paused" && <Badge variant="secondary" className="ml-1">paused</Badge>}</span>
              <span className="text-muted-foreground">Tools: {p.toolAllowlist.length ? p.toolAllowlist.join(", ") : "all"}</span>
              <span className="text-muted-foreground">
                Cap: {p.frequency.perSession || "∞"}/session · {p.frequency.perHourPerSession || "∞"}/hour
              </span>
              <span className="text-muted-foreground">Min CPC: ${p.floorCpc}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Create key dialog */}
      <Dialog open={!!newKeyMode} onOpenChange={(o) => !o && setNewKeyMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New {newKeyMode} key</DialogTitle>
            <DialogDescription>
              {newKeyMode === "live"
                ? "Live keys serve real, paid ads once your server is approved."
                : "Test keys always return a test ad and are never billed."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="keyLabel">Label (optional)</Label>
            <Input id="keyLabel" value={newKeyLabel} onChange={(e) => setNewKeyLabel(e.target.value)} placeholder="production, staging…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewKeyMode(null)}>Cancel</Button>
            <Button onClick={createKey} disabled={createKeyMut.isPending}>Create key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show-once secret dialog */}
      <Dialog open={!!revealed} onOpenChange={(o) => !o && setRevealed(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy your key now</DialogTitle>
            <DialogDescription>This is the only time the full key is shown. Store it as MKTOOL_API_KEY on your server.</DialogDescription>
          </DialogHeader>
          {revealed?.secret && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-2">
              <code className="text-xs break-all flex-1">{revealed.secret}</code>
              <CopyButton text={revealed.secret} />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setRevealed(null)}>I've copied it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default McpServerDetail;

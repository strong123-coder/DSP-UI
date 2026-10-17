import React, { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Check, ClipboardCheck, Image as ImageIcon, Network as NetworkIcon, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useApprovalQueue, useReview } from "@/query/useApproval";
import { useScope } from "@/query/useScope";
import type { ApprovalGroup, ApprovalItem, ApprovalKind, ApprovalStatus } from "@/services/approval";
import { changeText } from "@/utils/approval";

type Key = `${ApprovalKind}:${string}`;
const keyOf = (kind: ApprovalKind, id: string): Key => `${kind}:${id}`;

const KIND_LABEL: Record<ApprovalKind, string> = { campaign: "Campaign", lineItem: "Line item", creative: "Creative" };

const when = (iso?: string | null) => {
  if (!iso) return "";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

// Every reviewable item in a group: the campaign (when it's up for review
// itself), its line items and the creatives they use.
const itemsOf = (g: ApprovalGroup) => [
  ...(g.campaign?.inReview ? [{ kind: "campaign" as const, item: g.campaign }] : []),
  ...g.lineItems.map((item) => ({ kind: "lineItem" as const, item })),
  ...g.creatives.map((item) => ({ kind: "creative" as const, item })),
];

const ItemRow: React.FC<{
  kind: ApprovalKind;
  item: ApprovalItem;
  checked: boolean;
  onToggle: () => void;
  status: ApprovalStatus;
}> = ({ kind, item, checked, onToggle, status }) => {
  const changed = changeText(item.approval?.changes);
  const title = item.title || item.name || (kind === "creative" ? `${item.w || "?"}×${item.h || "?"} ${item.type || ""}` : "Untitled");
  return (
    <label className="flex items-start gap-3 px-4 py-3 border-t border-border first:border-t-0 cursor-pointer hover:bg-muted/20">
      <Checkbox checked={checked} onCheckedChange={onToggle} className="mt-0.5" aria-label={`Select ${KIND_LABEL[kind]} ${title}`} />
      {kind === "creative" && (
        item.link && item.type === "image" ? (
          <img src={item.link} alt="" className="w-12 h-12 rounded object-contain bg-muted border border-border shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded bg-muted border border-border flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        )
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">{KIND_LABEL[kind]}</span>
          <span className="font-medium text-sm truncate">{title}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {status === "rejected" ? (
            <>Rejected{item.approval?.note ? `: "${item.approval.note}"` : ""}</>
          ) : changed ? (
            <>Changed: <span className="text-foreground">{changed}</span></>
          ) : (
            <>New</>
          )}
          {item.approval?.submittedAt && status === "pending" && <> · {when(item.approval.submittedAt)}</>}
          {kind === "creative" && item.clickUrl && <> · clicks go to {item.clickUrl}</>}
        </div>
      </div>
    </label>
  );
};

const ApprovalPage: React.FC = () => {
  const scope = useScope();
  const [status, setStatus] = useState<ApprovalStatus>("pending");
  const { data, isLoading } = useApprovalQueue(status, scope.canApprove);
  const groups: ApprovalGroup[] = useMemo(() => data?.data?.data ?? [], [data]);
  const [selected, setSelected] = useState<Set<Key>>(new Set());
  const [rejecting, setRejecting] = useState<Key[] | null>(null);
  const [note, setNote] = useState("");
  const review = useReview();

  if (!scope.canApprove) return <Navigate to="/dashboard" replace />;

  const toggle = (k: Key) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const groupKeys = (g: ApprovalGroup) => itemsOf(g).map((x) => keyOf(x.kind, x.item.id));
  const toItems = (keys: Key[]) =>
    keys.map((k) => {
      const [kind, id] = k.split(":") as [ApprovalKind, string];
      return { kind, id };
    });

  const decide = (keys: Key[], decision: "approve" | "reject", text?: string) =>
    review.mutate(
      { items: toItems(keys), decision, note: text },
      {
        onSuccess: () => {
          setSelected((s) => new Set([...s].filter((k) => !keys.includes(k))));
          setRejecting(null);
          setNote("");
        },
      },
    );

  const switchTab = (s: ApprovalStatus) => {
    setStatus(s);
    setSelected(new Set());
  };

  const chosen = [...selected];
  const counts = data?.data?.counts;

  return (
    <div className="space-y-5 pb-24 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary" /> Approvals</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          What your networks created or changed. Approved items bid once the super admin has turned bidding on for the
          campaign. Rejected items go back to the network with your note.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-border" role="tablist">
        {([
          { id: "pending", label: "Waiting" },
          { id: "rejected", label: "Rejected" },
        ] as const).map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={status === t.id}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${status === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => switchTab(t.id)}>
            {t.label}
          </button>
        ))}
        {counts && (
          <span className="ml-auto text-xs text-muted-foreground tabular-nums pb-2">
            {counts.campaigns} campaign{counts.campaigns === 1 ? "" : "s"} · {counts.lineItems} line item{counts.lineItems === 1 ? "" : "s"} · {counts.creatives} creative{counts.creatives === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingFallback />
      ) : groups.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {status === "pending"
            ? "Nothing is waiting. When a network creates a campaign or changes its budget, bids, targeting or creatives, it shows up here."
            : "Nothing is rejected right now."}
        </Card>
      ) : (
        groups.map((g) => {
          const keys = groupKeys(g);
          const allOn = keys.length > 0 && keys.every((k) => selected.has(k));
          return (
            <Card key={g.key} className="p-0 overflow-hidden">
              <div className="flex items-start justify-between gap-3 px-4 py-3 bg-muted/30 flex-wrap">
                <div className="min-w-0">
                  <div className="font-semibold">
                    {g.campaign ? (
                      <Link to={`/campaign/view/${g.campaign.id}`} className="hover:underline">{g.campaign.title}</Link>
                    ) : (
                      "Creatives not used by any line item yet"
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                    {g.network?.name && (
                      <span className="inline-flex items-center gap-1"><NetworkIcon className="w-3 h-3" /> {g.network.name}</span>
                    )}
                    {g.advertiser && <span>{g.advertiser.name}</span>}
                    {g.campaign && !g.campaign.inReview && <span>Campaign itself is approved</span>}
                    {g.submittedAt && status === "pending" && <span>Last change {when(g.submittedAt)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer mr-1">
                    <Checkbox checked={allOn}
                      onCheckedChange={() =>
                        setSelected((s) => {
                          const n = new Set(s);
                          keys.forEach((k) => (allOn ? n.delete(k) : n.add(k)));
                          return n;
                        })
                      } />
                    Select all
                  </label>
                  {status === "pending" && (
                    <>
                      <Button type="button" variant="outline" size="sm" className="gap-1" disabled={review.isPending}
                        onClick={() => setRejecting(keys)}>
                        <X className="w-3.5 h-3.5" /> Reject all
                      </Button>
                      <Button type="button" size="sm" className="gap-1" disabled={review.isPending} onClick={() => decide(keys, "approve")}>
                        <Check className="w-3.5 h-3.5" /> Approve all
                      </Button>
                    </>
                  )}
                  {status === "rejected" && (
                    <Button type="button" size="sm" className="gap-1" disabled={review.isPending} onClick={() => decide(keys, "approve")}>
                      <Check className="w-3.5 h-3.5" /> Approve anyway
                    </Button>
                  )}
                </div>
              </div>
              <div>
                {itemsOf(g).map(({ kind, item }) => (
                  <ItemRow key={keyOf(kind, item.id)} kind={kind} item={item} status={status}
                    checked={selected.has(keyOf(kind, item.id))} onToggle={() => toggle(keyOf(kind, item.id))} />
                ))}
              </div>
            </Card>
          );
        })
      )}

      {chosen.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-6 py-3 flex items-center gap-3 justify-end z-20">
          <span className="text-sm text-muted-foreground mr-auto md:ml-64">{chosen.length} selected</span>
          <Button type="button" variant="outline" onClick={() => setSelected(new Set())}>Clear</Button>
          {status === "pending" && (
            <Button type="button" variant="outline" className="gap-1" disabled={review.isPending} onClick={() => setRejecting(chosen)}>
              <X className="w-4 h-4" /> Reject
            </Button>
          )}
          <Button type="button" className="gap-1" disabled={review.isPending} onClick={() => decide(chosen, "approve")}>
            <Check className="w-4 h-4" /> Approve
          </Button>
        </div>
      )}

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejecting?.length === 1 ? "this item" : `${rejecting?.length} items`}</DialogTitle>
            <DialogDescription>The network sees your note and can change it and send it again. Rejected items don't bid.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-note">What should they change?</Label>
            <Textarea id="reject-note" rows={4} maxLength={2000} value={note} autoFocus
              placeholder="e.g. Daily budget is above what we agreed; keep it under $500"
              onChange={(e) => setNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRejecting(null)} disabled={review.isPending}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={review.isPending || !note.trim()}
              onClick={() => rejecting && decide(rejecting, "reject", note.trim())}>
              {review.isPending ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalPage;

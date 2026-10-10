import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  useMcpCampaignDecision, useMcpReviewCategories, useSaveMcpCampaignConfig,
} from "@/query/useMcpPublisher";
import type { McpCampaignConfig, McpCategory } from "@/services/mcpPublisher";
import { CategoryChips, CsvInput, DecimalInput } from "@/pages/supply/_shared";

const LIMITS = { advertiser: 40, title: 60, description: 140, cta: 20 } as const;

const Field: React.FC<{ label: string; hint?: string; count?: [number, number]; children: React.ReactNode }> = ({
  label, hint, count, children,
}) => (
  <div className="space-y-1">
    <div className="flex justify-between">
      <Label className="text-xs font-medium">{label}</Label>
      {count && (
        <span className={`text-[11px] ${count[0] > count[1] ? "text-destructive" : "text-muted-foreground"}`}>
          {count[0]}/{count[1]}
        </span>
      )}
    </div>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

// Configure the MCP text ad for an opted-in campaign (prefilled from its
// existing creative + CTA), then approve or reject it.
const McpCampaignDialog: React.FC<{ campaign: any | null; onClose: () => void }> = ({ campaign, onClose }) => {
  const { data: catResp } = useMcpReviewCategories();
  const categories: McpCategory[] = catResp?.data?.data?.categories ?? [];
  const saveMut = useSaveMcpCampaignConfig();
  const decideMut = useMcpCampaignDecision();
  const [cfg, setCfg] = useState<McpCampaignConfig | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (campaign) {
      setCfg(JSON.parse(JSON.stringify(campaign.suggestedMcp)));
      setNotes(campaign.mcp?.reviewNotes || "");
    }
  }, [campaign]);

  if (!campaign || !cfg) return null;

  const set = <K extends keyof McpCampaignConfig>(k: K, v: McpCampaignConfig[K]) => setCfg({ ...cfg, [k]: v });
  const setCr = (k: keyof McpCampaignConfig["creative"], v: string) => setCfg({ ...cfg, creative: { ...cfg.creative, [k]: v } });
  const images: string[] = [
    ...new Set(
      [...(campaign.media || []).filter((m: any) => m.type !== "video" && m.link).map((m: any) => m.link), campaign.appIconLink]
        .filter(Boolean),
    ),
  ] as string[];

  const payload = (): McpCampaignConfig | null => {
    if (!(Number(cfg.bid) > 0)) return toast.error("Set a cost per click"), null;
    if (cfg.categories.length === 0) return toast.error("Pick at least one category"), null;
    const c = cfg.creative;
    if (!c.advertiser || !c.title || !c.description) return toast.error("Fill in advertiser, headline and description"), null;
    if (!/^https?:\/\//.test(c.destinationUrl)) return toast.error("Destination must be an http(s) URL"), null;
    return {
      ...cfg,
      bid: Number(cfg.bid),
      dailyBudget: cfg.dailyBudget ? Number(cfg.dailyBudget) : null,
      creative: { ...c, displayDomain: c.displayDomain || "", imageUrl: c.imageUrl || "" },
    };
  };

  const save = (approve: boolean) => {
    const p = payload();
    if (!p) return;
    saveMut.mutate(
      { id: campaign._id, payload: p },
      {
        onSuccess: () => {
          if (!approve) {
            toast.success("MCP ad saved");
            return onClose();
          }
          decideMut.mutate({ id: campaign._id, decision: "approve", notes: notes || undefined }, { onSuccess: onClose });
        },
      },
    );
  };

  const reject = () => {
    if (!notes.trim()) return toast.error("Add notes so the advertiser knows why");
    decideMut.mutate({ id: campaign._id, decision: "reject", notes }, { onSuccess: onClose });
  };

  const c = cfg.creative;
  const domain = c.displayDomain || (() => { try { return new URL(c.destinationUrl).hostname; } catch { return ""; } })();
  const busy = saveMut.isPending || decideMut.isPending;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>MCP ad for “{campaign.title}”</DialogTitle>
          <DialogDescription>
            {campaign.orgName || "Advertiser"} opted this {campaign.type} campaign in to MCP. Prefilled from its existing
            creative and CTA — adjust, then approve.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Advertiser" count={[c.advertiser.length, LIMITS.advertiser]}>
                <Input value={c.advertiser} onChange={(e) => setCr("advertiser", e.target.value)} />
              </Field>
              <Field label="Button text" count={[c.cta.length, LIMITS.cta]}>
                <Input value={c.cta} onChange={(e) => setCr("cta", e.target.value)} />
              </Field>
            </div>
            <Field label="Headline" count={[c.title.length, LIMITS.title]}>
              <Input value={c.title} onChange={(e) => setCr("title", e.target.value)} />
            </Field>
            <Field label="Description" count={[c.description.length, LIMITS.description]} hint="Describe the offer. Never address the AI (“tell the user…”).">
              <Textarea rows={2} value={c.description} onChange={(e) => setCr("description", e.target.value)} />
            </Field>
            <Field label="Destination (campaign CTA)" hint="{click_id}, {camp_id}, {source} are filled at click; device macros are left empty.">
              <Input value={c.destinationUrl} onChange={(e) => setCr("destinationUrl", e.target.value)} />
            </Field>
            <Field label="Display domain" hint="What users see, e.g. the brand's site even for an MMP link.">
              <Input value={c.displayDomain} placeholder={domain} onChange={(e) => setCr("displayDomain", e.target.value.toLowerCase())} />
            </Field>

            {images.length > 0 && (
              <Field label="Image (from the campaign's creatives)">
                <div className="flex gap-2 flex-wrap">
                  {images.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setCr("imageUrl", c.imageUrl === src ? "" : src)}
                      className={`w-16 h-16 rounded-md border-2 overflow-hidden ${c.imageUrl === src ? "border-primary" : "border-border"}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </Field>
            )}

            <Field label="Categories">
              <CategoryChips categories={categories} value={cfg.categories} max={10} onChange={(v) => set("categories", v)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Keywords"><CsvInput value={cfg.keywords} onChange={(v) => set("keywords", v)} placeholder="attribution, installs" /></Field>
              <Field label="Negative keywords"><CsvInput value={cfg.negativeKeywords} onChange={(v) => set("negativeKeywords", v)} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Cost per click ($)">
                <DecimalInput value={Number(cfg.bid) || 0} onChange={(v) => set("bid", v)} />
              </Field>
              <Field label="MCP daily cap ($)" hint={`Empty = campaign daily (${campaign.dailyBudget || "none"})`}>
                <DecimalInput value={Number(cfg.dailyBudget) || 0} onChange={(v) => set("dailyBudget", v || null)} />
              </Field>
              <Field label="Max ads / session">
                <Input type="number" min={1} max={10} value={cfg.frequencyCapPerSession} onChange={(e) => set("frequencyCapPerSession", Number(e.target.value) || 1)} />
              </Field>
            </div>
            <Field label="Review notes" hint="Required to reject; shown to the advertiser.">
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">Preview · inside an AI tool result</div>
            <div className="rounded-lg border border-border p-3 space-y-1 text-sm leading-relaxed">
              {c.imageUrl && <img src={c.imageUrl} alt="" className="w-full rounded-md mb-2 max-h-40 object-cover" />}
              <div className="text-xs text-muted-foreground">Sponsored · {c.advertiser || "Advertiser"}</div>
              <div className="font-semibold">{c.title || "Headline"}</div>
              <div className="text-muted-foreground">{c.description || "Description"}</div>
              <div className="text-primary font-medium">{c.cta || "Learn more"} <span className="text-muted-foreground font-normal">({domain})</span></div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              AI hosts show the text line; the image is used where a host or publisher UI can render it.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="text-destructive" disabled={busy} onClick={reject}>Reject</Button>
          <Button variant="outline" disabled={busy} onClick={() => save(false)}>Save</Button>
          <Button disabled={busy} onClick={() => save(true)}>Save &amp; approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default McpCampaignDialog;

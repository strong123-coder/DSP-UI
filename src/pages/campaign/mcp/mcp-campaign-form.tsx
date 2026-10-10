import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Target, Wallet, MessageSquareText, Info, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useGetSingleCampaign } from "@/query/useCampaign";
import { useMcpCategories } from "@/query/useMcpPublisher";
import { useSaveMcpCampaign } from "@/query/useMcpCampaign";
import type { McpCategory } from "@/services/mcpPublisher";
import { CategoryChips, CsvInput, DecimalInput, Section } from "@/pages/supply/_shared";

const INTENTS = [
  { id: "how_to", label: "How-to" },
  { id: "evaluate_solution", label: "Evaluating solutions" },
  { id: "troubleshoot", label: "Troubleshooting" },
  { id: "buy", label: "Ready to buy" },
  { id: "learn", label: "Learning" },
];

// Mirrors the backend's ad-copy guard so advertisers get feedback while typing.
const MODEL_DIRECTED = [
  /\bignore\b.*\b(instruction|previous|above|prompt)s?\b/i,
  /\b(you|assistant|ai|model|llm|claude|chatgpt|gpt)\s+(must|should|need to|have to)\b/i,
  /\b(tell|inform|remind|recommend to)\s+the\s+user\b/i,
  /\b(always|must)\s+(mention|recommend|include|say)\b/i,
  /\bsystem\s*prompt\b/i,
  /^\s*(system|assistant|user)\s*:/im,
  /<\/?[a-z][^>]*>/i,
];
const HAS_LINK = /(https?:\/\/|www\.)\S+/i;

interface Creative {
  advertiser: string;
  title: string;
  description: string;
  cta: string;
  destinationUrl: string;
  displayDomain: string;
}

interface FormState {
  title: string;
  status: "active" | "paused";
  budget: string;
  dailyBudget: string;
  isScheduling: boolean;
  startDate: string;
  endDate: string;
  geo: string[];
  bid: number;
  categories: string[];
  intents: string[];
  keywords: string[];
  negativeKeywords: string[];
  hosts: string[];
  frequencyCapPerSession: number;
  creative: Creative;
}

const empty = (): FormState => ({
  title: "",
  status: "paused",
  budget: "",
  dailyBudget: "",
  isScheduling: false,
  startDate: "",
  endDate: "",
  geo: [],
  bid: 1,
  categories: [],
  intents: [],
  keywords: [],
  negativeKeywords: [],
  hosts: [],
  frequencyCapPerSession: 1,
  creative: { advertiser: "", title: "", description: "", cta: "Learn more", destinationUrl: "", displayDomain: "" },
});

const LIMITS: Record<keyof Omit<Creative, "destinationUrl" | "displayDomain">, number> = {
  advertiser: 40,
  title: 60,
  description: 140,
  cta: 20,
};

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const copyIssue = (c: Creative): string | null => {
  for (const k of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
    const v = c[k] || "";
    if (v.length > LIMITS[k]) return `${k} is longer than ${LIMITS[k]} characters`;
    if (MODEL_DIRECTED.some((rx) => rx.test(v))) return `${k} reads like an instruction to the AI. Describe the offer instead.`;
    if (HAS_LINK.test(v)) return `${k} must not contain links; use the landing page field`;
  }
  return null;
};

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode; count?: [number, number] }> = ({
  label,
  hint,
  children,
  count,
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between">
      <Label className="text-sm font-medium">{label}</Label>
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

// How the ad renders under an MCP tool result.
const ChatPreview: React.FC<{ c: Creative }> = ({ c }) => {
  const domain = c.displayDomain || hostOf(c.destinationUrl) || "your-site.com";
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-sm">
      <div className="text-xs text-muted-foreground">Preview · inside an AI tool result</div>
      <div className="rounded-lg bg-muted/40 p-3 text-muted-foreground text-xs">
        Here is the comparison you asked for: …
      </div>
      <div className="rounded-lg border border-border p-3 space-y-0.5 leading-relaxed">
        <div className="text-xs text-muted-foreground">Sponsored · {c.advertiser || "Advertiser"}</div>
        <div className="font-semibold">{c.title || "Your headline"}</div>
        <div className="text-muted-foreground">{c.description || "One or two lines describing the offer."}</div>
        <div className="text-primary font-medium">
          {c.cta || "Learn more"} <span className="text-muted-foreground font-normal">({domain})</span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Shown at most once per session per server. Plain text — hosts render it in their own style.
      </p>
    </div>
  );
};

const McpCampaignForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { data: loaded, isLoading } = useGetSingleCampaign(id ?? "", isEdit);
  const { data: catResp } = useMcpCategories();
  const categories: McpCategory[] = catResp?.data?.data?.categories ?? [];
  const saveMut = useSaveMcpCampaign();

  const [f, setF] = useState<FormState>(empty());
  const [review, setReview] = useState<{ status?: string; notes?: string | null }>({});

  useEffect(() => {
    const c = loaded?.data?.data;
    if (!isEdit || !c) return;
    if (c.type !== "mcp") {
      navigate(`/campaign/edit/${id}`, { replace: true });
      return;
    }
    setF({
      title: c.title ?? "",
      status: c.status === "active" ? "active" : "paused",
      budget: c.budget ?? "",
      dailyBudget: c.dailyBudget ?? "",
      isScheduling: !!c.isScheduling,
      startDate: c.startDate ? String(c.startDate).slice(0, 10) : "",
      endDate: c.endDate ? String(c.endDate).slice(0, 10) : "",
      geo: c.geo ?? [],
      bid: c.mcp?.bid ?? 1,
      categories: c.mcp?.categories ?? [],
      intents: c.mcp?.intents ?? [],
      keywords: c.mcp?.keywords ?? [],
      negativeKeywords: c.mcp?.negativeKeywords ?? [],
      hosts: c.mcp?.hosts ?? [],
      frequencyCapPerSession: c.mcp?.frequencyCapPerSession ?? 1,
      creative: { ...empty().creative, ...(c.mcp?.creative ?? {}), displayDomain: c.mcp?.creative?.displayDomain ?? "" },
    });
    setReview({ status: c.mcp?.reviewStatus, notes: c.mcp?.reviewNotes });
  }, [isEdit, loaded, id, navigate]);

  const issue = useMemo(() => copyIssue(f.creative), [f.creative]);

  if (isEdit && isLoading) return <LoadingFallback />;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const setCr = <K extends keyof Creative>(k: K, v: Creative[K]) => setF((s) => ({ ...s, creative: { ...s.creative, [k]: v } }));

  const save = () => {
    if (!f.title.trim()) return toast.error("Campaign name is required");
    if (f.categories.length === 0) return toast.error("Pick at least one category");
    if (!(f.bid > 0)) return toast.error("Bid must be greater than 0");
    if (!f.creative.destinationUrl.startsWith("https://")) return toast.error("Landing page must start with https://");
    if (!f.creative.advertiser || !f.creative.title || !f.creative.description) return toast.error("Fill in advertiser, headline and description");
    if (issue) return toast.error(issue);

    const payload: Record<string, unknown> = {
      title: f.title.trim(),
      status: f.status,
      budget: f.budget || undefined,
      dailyBudget: f.dailyBudget || undefined,
      isScheduling: f.isScheduling,
      startDate: f.isScheduling && f.startDate ? f.startDate : undefined,
      endDate: f.isScheduling && f.endDate ? f.endDate : undefined,
      geo: f.geo.map((g) => g.toUpperCase()),
      mcp: {
        pricingModel: "cpc",
        bid: f.bid,
        categories: f.categories,
        intents: f.intents,
        keywords: f.keywords.map((k) => k.toLowerCase()),
        negativeKeywords: f.negativeKeywords.map((k) => k.toLowerCase()),
        hosts: f.hosts.map((h) => h.toLowerCase()),
        frequencyCapPerSession: f.frequencyCapPerSession,
        creative: { ...f.creative, displayDomain: f.creative.displayDomain || undefined },
      },
    };
    if (!isEdit) payload.type = "mcp";
    saveMut.mutate({ id, payload }, { onSuccess: () => navigate("/campaign/list") });
  };

  return (
    <div className="pb-10 space-y-5">
      <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate("/campaign/list")}>
        <ArrowLeft className="w-4 h-4" /> Campaigns
      </Button>

      {isEdit && review.status && (
        <div
          className={`rounded-lg border text-sm p-3 flex gap-2 ${
            review.status === "approved"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : review.status === "rejected"
                ? "border-red-300 bg-red-50 text-red-900"
                : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          {review.status === "rejected" ? <ShieldAlert className="w-4 h-4 mt-0.5" /> : <Info className="w-4 h-4 mt-0.5" />}
          <div>
            Ad review: <b className="capitalize">{review.status}</b>
            {review.notes && <> — {review.notes}</>}
            <div className="text-xs opacity-80">Changing the ad copy or landing page sends it back to review. Bid, budget and targeting changes don't.</div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
        <div className="space-y-5">
          <Section icon={<Sparkles className="w-4 h-4 text-primary" />} title="MCP campaign" desc="A sponsored text line shown under relevant AI tool results. You pay per valid click.">
            <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end">
              <Field label="Campaign name">
                <Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Acme — attribution Q4" />
              </Field>
              <div className="flex items-center gap-2 pb-2">
                <Switch checked={f.status === "active"} onCheckedChange={(v) => set("status", v ? "active" : "paused")} />
                <span className="text-sm">{f.status === "active" ? "Active" : "Paused"}</span>
              </div>
            </div>
          </Section>

          <Section icon={<MessageSquareText className="w-4 h-4 text-primary" />} title="Ad copy" desc="Describe the offer. Copy addressed to the AI (“tell the user…”) is rejected.">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Advertiser name" count={[f.creative.advertiser.length, LIMITS.advertiser]}>
                <Input value={f.creative.advertiser} onChange={(e) => setCr("advertiser", e.target.value)} placeholder="Acme Analytics" />
              </Field>
              <Field label="Button text" count={[f.creative.cta.length, LIMITS.cta]}>
                <Input value={f.creative.cta} onChange={(e) => setCr("cta", e.target.value)} placeholder="Learn more" />
              </Field>
            </div>
            <Field label="Headline" count={[f.creative.title.length, LIMITS.title]}>
              <Input value={f.creative.title} onChange={(e) => setCr("title", e.target.value)} placeholder="Server-side attribution in 10 minutes" />
            </Field>
            <Field label="Description" count={[f.creative.description.length, LIMITS.description]}>
              <Textarea rows={2} value={f.creative.description} onChange={(e) => setCr("description", e.target.value)} placeholder="Fix GA4 data loss with first-party tracking." />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Landing page (https)">
                <Input value={f.creative.destinationUrl} onChange={(e) => setCr("destinationUrl", e.target.value)} placeholder="https://acme.example/offer?src=mcp" />
              </Field>
              <Field label="Display domain" hint="Defaults to the landing page's domain.">
                <Input value={f.creative.displayDomain} onChange={(e) => setCr("displayDomain", e.target.value.toLowerCase())} placeholder={hostOf(f.creative.destinationUrl) || "acme.example"} />
              </Field>
            </div>
            {issue && <p className="text-xs text-destructive">{issue}</p>}
          </Section>

          <Section icon={<Target className="w-4 h-4 text-primary" />} title="Targeting" desc="Ads only serve where the MCP server's category matches. Keywords and intent raise relevance.">
            <Field label="Categories">
              <CategoryChips categories={categories} value={f.categories} max={10} onChange={(v) => set("categories", v)} />
            </Field>
            <Field label="Intents (optional)">
              <CategoryChips categories={INTENTS} value={f.intents} onChange={(v) => set("intents", v)} />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Keywords" hint="Comma-separated, max 50.">
                <CsvInput value={f.keywords} onChange={(v) => set("keywords", v)} placeholder="attribution, ga4" />
              </Field>
              <Field label="Negative keywords" hint="Never show when these appear.">
                <CsvInput value={f.negativeKeywords} onChange={(v) => set("negativeKeywords", v)} placeholder="free, open source" />
              </Field>
              <Field label="Only these AI hosts" hint="Empty = all hosts, e.g. claude-ai, cursor">
                <CsvInput value={f.hosts} onChange={(v) => set("hosts", v)} placeholder="all hosts" />
              </Field>
              <Field label="Countries" hint="ISO codes. Empty = all countries.">
                <CsvInput value={f.geo} onChange={(v) => set("geo", v)} placeholder="US, IN" />
              </Field>
            </div>
          </Section>

          <Section icon={<Wallet className="w-4 h-4 text-primary" />} title="Bid & budget">
            <div className="grid md:grid-cols-4 gap-4">
              <Field label="Max cost per click ($)">
                <DecimalInput value={f.bid} onChange={(v) => set("bid", v)} />
              </Field>
              <Field label="Daily budget ($)">
                <Input type="number" min={0} value={f.dailyBudget} onChange={(e) => set("dailyBudget", e.target.value)} placeholder="no cap" />
              </Field>
              <Field label="Total budget ($)">
                <Input type="number" min={0} value={f.budget} onChange={(e) => set("budget", e.target.value)} placeholder="no cap" />
              </Field>
              <Field label="Max ads / user session">
                <Input type="number" min={1} max={10} value={f.frequencyCapPerSession} onChange={(e) => set("frequencyCapPerSession", Number(e.target.value))} />
              </Field>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={f.isScheduling} onCheckedChange={(v) => set("isScheduling", v)} />
              <span className="text-sm">Run on a schedule</span>
            </div>
            {f.isScheduling && (
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Start date"><Input type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
                <Field label="End date"><Input type="date" value={f.endDate} onChange={(e) => set("endDate", e.target.value)} /></Field>
              </div>
            )}
          </Section>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate("/campaign/list")}>Cancel</Button>
            <Button onClick={save} disabled={saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : isEdit ? "Save changes" : "Create & submit for review"}
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-4 space-y-3">
          <ChatPreview c={f.creative} />
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Badge variant="secondary">CPC</Badge> You're only charged for valid clicks. Bots, duplicates and instant clicks are filtered.
          </div>
        </div>
      </div>
    </div>
  );
};

export default McpCampaignForm;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Info, LayoutList, ShieldBan, Tags } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import LoadingFallback from "@/components/ui/loading-fallback";
import {
  useCreateMcpServer,
  useMcpCategories,
  useMcpServer,
  useUpdateMcpServer,
} from "@/query/useMcpPublisher";
import {
  toServerPayload,
  type McpCategory,
  type McpPlacement,
  type McpServer,
} from "@/services/mcpPublisher";
import { CategoryChips, CsvInput, DecimalInput, Section } from "../_shared";

const COMMON_HOSTS = ["claude-ai", "claude-code", "chatgpt", "cursor", "vscode", "windsurf"];
const PLACEMENT_KEY = /^[a-z0-9_]{2,40}$/;
const DEFAULT_CATEGORY = "__default__";

const emptyPlacement = (key = "tool_footer"): McpPlacement => ({
  key,
  name: key === "tool_footer" ? "Tool result footer" : "",
  format: "text_card",
  status: "active",
  toolAllowlist: [],
  toolCategoryMap: {},
  frequency: { perSession: 1, perHourPerSession: 3 },
  floorCpc: 0,
});

const emptyServer = (): McpServer => ({
  name: "",
  description: "",
  serverUrl: "",
  homepage: "",
  transport: "stdio",
  categories: [],
  blockedCategories: [],
  blockedAdvertiserDomains: [],
  blockedHosts: [],
  placements: [emptyPlacement()],
});

const Field: React.FC<{ label: string; hint?: string; htmlFor?: string; children: React.ReactNode }> = ({
  label,
  hint,
  htmlFor,
  children,
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor} className="text-sm font-medium">{label}</Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

const validate = (s: McpServer): string | null => {
  if (s.name.trim().length < 2) return "Server name is required";
  if (s.categories.length === 0) return "Pick at least one category";
  if (s.serverUrl && !s.serverUrl.startsWith("https://")) return "Server URL must start with https://";
  const keys = new Set<string>();
  for (const p of s.placements) {
    if (!PLACEMENT_KEY.test(p.key)) return `Placement key "${p.key}" must be 2-40 chars of a-z, 0-9, _`;
    if (keys.has(p.key)) return `Duplicate placement key "${p.key}"`;
    keys.add(p.key);
  }
  return null;
};

const McpServerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: loaded, isLoading } = useMcpServer(id);
  const { data: catResp } = useMcpCategories();
  const categories: McpCategory[] = catResp?.data?.data?.categories ?? [];
  const createMut = useCreateMcpServer();
  const updateMut = useUpdateMcpServer();

  const [form, setForm] = useState<McpServer>(emptyServer());

  useEffect(() => {
    if (isEdit && loaded?.data?.data) {
      const s = JSON.parse(JSON.stringify(loaded.data.data)) as McpServer;
      s.placements = s.placements.map((p) => ({ ...emptyPlacement(p.key), ...p, toolCategoryMap: p.toolCategoryMap || {} }));
      setForm(s);
    }
  }, [isEdit, loaded]);

  if (isEdit && isLoading) return <LoadingFallback />;

  const frozen = isEdit && (form.status === "in_review" || form.status === "suspended");
  const set = <K extends keyof McpServer>(k: K, v: McpServer[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setPlacement = (i: number, patch: Partial<McpPlacement>) =>
    setForm((f) => ({ ...f, placements: f.placements.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));

  const save = () => {
    const err = validate(form);
    if (err) {
      toast.error(err);
      return;
    }
    // Drop mappings for tools that are no longer allowed.
    const clean: McpServer = {
      ...form,
      placements: form.placements.map((p) => ({
        ...p,
        toolCategoryMap: Object.fromEntries(
          Object.entries(p.toolCategoryMap).filter(
            ([tool, cat]) => cat && (p.toolAllowlist.length === 0 || p.toolAllowlist.includes(tool)),
          ),
        ),
      })),
    };
    const payload = toServerPayload(clean);
    if (isEdit) {
      updateMut.mutate({ id: id!, payload }, { onSuccess: () => navigate(`/supply/servers/${id}`) });
    } else {
      createMut.mutate(payload, {
        onSuccess: (r: any) => navigate(`/supply/servers/${r?.data?.data?._id}`),
      });
    }
  };

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-5 max-w-4xl pb-10">
      <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => navigate(isEdit ? `/supply/servers/${id}` : "/supply/servers")}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {frozen && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-sm p-3 flex gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          This server is {form.status === "in_review" ? "in review" : "suspended"} and can't be edited right now.
        </div>
      )}

      <fieldset disabled={frozen} className="space-y-5">
        <Section icon={<Info className="w-4 h-4 text-primary" />} title="About your server" desc="Used by our review team and to match relevant advertisers.">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Server name" htmlFor="name">
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Report Query Engine" />
            </Field>
            <Field label="Transport">
              <Select value={form.transport} onValueChange={(v) => set("transport", v as McpServer["transport"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stdio">stdio (local)</SelectItem>
                  <SelectItem value="http">HTTP (remote)</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Homepage, listing or repo" htmlFor="homepage" hint="Helps us review faster.">
              <Input id="homepage" value={form.homepage || ""} onChange={(e) => set("homepage", e.target.value)} placeholder="https://github.com/acme/mcp-server" />
            </Field>
            <Field label="Remote MCP URL (optional)" htmlFor="serverUrl" hint="Only for review. We never call it.">
              <Input id="serverUrl" value={form.serverUrl || ""} onChange={(e) => set("serverUrl", e.target.value)} placeholder="https://mcp.acme.com/mcp" />
            </Field>
          </div>
          <Field label="What does it do?" htmlFor="description">
            <Textarea id="description" rows={3} value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Lets analysts query campaign reports and attribution data from chat." />
          </Field>
        </Section>

        <Section
          icon={<Tags className="w-4 h-4 text-primary" />}
          title="Categories"
          desc="What your server is about (1–5). Ads are matched to these. Sensitive categories only serve if you select them here."
        >
          <CategoryChips
            categories={categories}
            value={form.categories}
            max={5}
            disabledIds={form.blockedCategories}
            onChange={(v) => set("categories", v)}
          />
        </Section>

        <Section
          icon={<LayoutList className="w-4 h-4 text-primary" />}
          title="Placements"
          desc="Where a sponsored line may appear. The SDK uses tool_footer by default."
          action={
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => set("placements", [...form.placements, emptyPlacement("")])} disabled={form.placements.length >= 10}>
              <Plus className="w-4 h-4" /> Add placement
            </Button>
          }
        >
          {form.placements.map((p, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Switch checked={p.status !== "paused"} onCheckedChange={(v) => setPlacement(i, { status: v ? "active" : "paused" })} />
                  <span className="text-sm font-medium">{p.key || "new placement"}</span>
                </div>
                {form.placements.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => set("placements", form.placements.filter((_, j) => j !== i))}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Placement key" hint="Sent by the SDK. a-z, 0-9 and _ only.">
                  <Input value={p.key} onChange={(e) => setPlacement(i, { key: e.target.value.toLowerCase() })} placeholder="tool_footer" />
                </Field>
                <Field label="Name">
                  <Input value={p.name || ""} onChange={(e) => setPlacement(i, { name: e.target.value })} placeholder="Tool result footer" />
                </Field>
              </div>

              <Field label="Tools that may show an ad" hint="Comma-separated tool names. Leave empty to allow every tool. Leave out tools that return personal or sensitive data.">
                <CsvInput value={p.toolAllowlist} onChange={(v) => setPlacement(i, { toolAllowlist: v })} placeholder="list_reports, browse_reports" />
              </Field>

              {p.toolAllowlist.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category per tool</Label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {p.toolAllowlist.map((tool) => (
                      <div key={tool} className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded min-w-[120px] truncate">{tool}</code>
                        <Select
                          value={p.toolCategoryMap[tool] || DEFAULT_CATEGORY}
                          onValueChange={(v) => {
                            const map = { ...p.toolCategoryMap };
                            if (v === DEFAULT_CATEGORY) delete map[tool];
                            else map[tool] = v;
                            setPlacement(i, { toolCategoryMap: map });
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DEFAULT_CATEGORY}>Server's first category</SelectItem>
                            {categories
                              .filter((c) => form.categories.includes(c.id))
                              .map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <Field label="Max ads / session" hint="0 = no cap">
                  <Input type="number" min={0} max={20} value={p.frequency.perSession} onChange={(e) => setPlacement(i, { frequency: { ...p.frequency, perSession: Number(e.target.value) } })} />
                </Field>
                <Field label="Max ads / hour" hint="0 = no cap">
                  <Input type="number" min={0} max={60} value={p.frequency.perHourPerSession} onChange={(e) => setPlacement(i, { frequency: { ...p.frequency, perHourPerSession: Number(e.target.value) } })} />
                </Field>
                <Field label="Min price per click ($)">
                  <DecimalInput value={p.floorCpc} onChange={(v) => setPlacement(i, { floorCpc: v })} />
                </Field>
              </div>
            </div>
          ))}
        </Section>

        <Section icon={<ShieldBan className="w-4 h-4 text-primary" />} title="Ad controls" desc="Changes apply within seconds, no redeploy needed.">
          <Field label="Blocked categories">
            <CategoryChips
              categories={categories}
              value={form.blockedCategories}
              disabledIds={form.categories}
              onChange={(v) => set("blockedCategories", v)}
            />
          </Field>
          <Field label="Blocked advertiser domains" hint="Comma-separated, e.g. competitor.com">
            <CsvInput value={form.blockedAdvertiserDomains} onChange={(v) => set("blockedAdvertiserDomains", v)} placeholder="competitor.com" />
          </Field>
          <Field label="Never show ads in these AI hosts" hint={`MCP client names. Common: ${COMMON_HOSTS.join(", ")}. Block any host whose policy doesn't allow sponsored content.`}>
            <CsvInput value={form.blockedHosts} onChange={(v) => set("blockedHosts", v.map((h) => h.toLowerCase()))} placeholder="claude-ai" />
          </Field>
        </Section>
      </fieldset>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(isEdit ? `/supply/servers/${id}` : "/supply/servers")}>Cancel</Button>
        <Button onClick={save} disabled={busy || frozen}>
          {busy ? "Saving…" : isEdit ? "Save changes" : "Create server"}
        </Button>
      </div>
    </div>
  );
};

export default McpServerForm;

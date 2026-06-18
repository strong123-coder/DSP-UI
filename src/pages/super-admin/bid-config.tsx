import { useMemo, useState } from "react";
import { Trash2, Plus, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetBidConfig,
  useGetAllCampaigns,
  useUpsertBidConfig,
  useUpsertCampaignBid,
  useRemoveCampaignBid,
  useSetCampaignEnableBidding,
} from "@/query/useBidConfig";

export default function BidConfig() {
  const { data: cfgResp, isLoading } = useGetBidConfig();
  const { data: campsResp } = useGetAllCampaigns();
  const upsertConfig = useUpsertBidConfig();
  const upsertCampaign = useUpsertCampaignBid();
  const removeCampaign = useRemoveCampaignBid();
  const setEnableBidding = useSetCampaignEnableBidding();

  const config = cfgResp?.data?.config;
  const campaignBids: any[] = config?.campaignBids ?? [];
  const allCampaigns: any[] = campsResp?.data?.data ?? [];

  // Global settings (controlled, seeded from the loaded config).
  const [status, setStatus] = useState<string | null>(null);
  const [defaultBidPrice, setDefaultBidPrice] = useState<string>("");

  const statusValue = status ?? config?.status ?? "active";
  const defaultBidValue =
    defaultBidPrice !== "" ? defaultBidPrice : config?.defaultBidPrice ?? "";

  // New / edit entry form.
  const [campaignId, setCampaignId] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [enabled, setEnabled] = useState(true);

  const campaignsById = useMemo(() => {
    const m: Record<string, any> = {};
    allCampaigns.forEach((c) => (m[c.campaignId] = c));
    return m;
  }, [allCampaigns]);

  const saveSettings = () => {
    upsertConfig.mutate({
      status: statusValue,
      defaultBidPrice: defaultBidValue === "" ? null : Number(defaultBidValue),
    });
  };

  const addEntry = () => {
    if (!campaignId || bidPrice === "") return;
    const c = campaignsById[campaignId];
    upsertCampaign.mutate(
      {
        campaignId,
        campaignTitle: c?.title ?? null,
        bidPrice: Number(bidPrice),
        currency: currency || "USD",
        enabled,
      },
      {
        onSuccess: () => {
          setCampaignId("");
          setBidPrice("");
          setCurrency("USD");
          setEnabled(true);
        },
      }
    );
  };

  const editEntry = (row: any) => {
    setCampaignId(row.campaignId);
    setBidPrice(String(row.bidPrice));
    setCurrency(row.currency || "USD");
    setEnabled(row.enabled !== false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Bid Configuration</h1>
      <p className="text-sm text-muted-foreground -mt-3">
        Per-campaign bid overrides used by the bid engine. Precedence: campaign
        entry below → default bid → campaign&apos;s own price → engine default.
      </p>

      {/* Global settings */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold">Global Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={statusValue}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Default Bid (CPM)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 1.00 (blank = none)"
                value={defaultBidValue as any}
                onChange={(e) => setDefaultBidPrice(e.target.value)}
                className="h-10"
              />
            </div>
            <Button onClick={saveSettings} disabled={upsertConfig.isPending} className="cursor-pointer">
              {upsertConfig.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add / edit a campaign bid */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="font-semibold">Add / Update Campaign Bid</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2 lg:col-span-2">
              <Label>Campaign</Label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
              >
                <option value="">Select a campaign…</option>
                {allCampaigns.map((c) => (
                  <option key={c.campaignId} value={c.campaignId}>
                    {c.title} — {c.orgName} ({c.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Bid Price (CPM)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.19"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                className="h-10"
              />
            </div>
            <div className="flex items-center gap-2 h-10">
              <input
                id="enabled"
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="enabled" className="cursor-pointer">Enabled</Label>
            </div>
          </div>
          <Button
            onClick={addEntry}
            disabled={!campaignId || bidPrice === "" || upsertCampaign.isPending}
            className="cursor-pointer"
          >
            {upsertCampaign.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Save campaign bid
          </Button>
        </CardContent>
      </Card>

      {/* Existing entries */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold">Configured Campaign Bids</h2>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Campaign ID</th>
                  <th className="px-5 py-3 font-medium text-right">Bid</th>
                  <th className="px-5 py-3 font-medium">Currency</th>
                  <th className="px-5 py-3 font-medium">Enabled</th>
                  <th className="px-5 py-3 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {campaignBids.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                      No campaign bids configured yet.
                    </td>
                  </tr>
                )}
                {campaignBids.map((r) => (
                  <tr key={r.campaignId} className="border-b border-border/60 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      {r.campaignTitle || campaignsById[r.campaignId]?.title || "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.campaignId}</td>
                    <td className="px-5 py-3 text-right">{r.bidPrice} {r.currency || "USD"}</td>
                    <td className="px-5 py-3">{r.currency || "USD"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${r.enabled !== false ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {r.enabled !== false ? "ENABLED" : "DISABLED"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                      <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => editEntry(r)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => removeCampaign.mutate(r.campaignId)}
                        disabled={removeCampaign.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Per-campaign bidding eligibility (enableBidding flag on the campaign) */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="font-semibold">Campaign Bidding</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enable or disable whether each campaign is eligible to bid in the
                engine.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Organization</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Bidding</th>
                </tr>
              </thead>
              <tbody>
                {allCampaigns.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                      No campaigns found.
                    </td>
                  </tr>
                )}
                {allCampaigns.map((c) => {
                  const enabled = c.enableBidding === true;
                  return (
                    <tr key={c.campaignId} className="border-b border-border/60 hover:bg-muted/40">
                      <td className="px-5 py-3">{c.title}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.orgName || "—"}</td>
                      <td className="px-5 py-3 capitalize text-muted-foreground">{c.status}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                          >
                            {enabled ? "ENABLED" : "DISABLED"}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                            disabled={setEnableBidding.isPending}
                            onClick={() =>
                              setEnableBidding.mutate({
                                campaignId: c.campaignId,
                                enableBidding: !enabled,
                              })
                            }
                          >
                            {enabled ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

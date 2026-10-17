import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Pencil, Plus, Trash2, Layers, AlertTriangle, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingFallback from "@/components/ui/loading-fallback";
import DeletePopupModal from "@/components/popupModals/delete-popup-modal";
import { useGetSingleCampaign } from "@/query/useCampaign";
import { useDeleteLineItem, useLineItems, useLineItemStatus } from "@/query/useLineItem";
import type { LineItem } from "@/services/lineItem";
import { StatusBadge, TypeBadge } from "../campaignList/components/campaign-table-body";
import ApprovalPill from "@/components/approval/approval-pill";
import { useScope } from "@/query/useScope";

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

const money = (v: unknown, cur = "USD", impressions = false) => {
  const n = Number(v);
  if (!v || isNaN(n) || n <= 0) return "—";
  return impressions ? `${n.toLocaleString()} imps` : `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${cur}`;
};

const geoSummary = (li: LineItem) => {
  const inc = li.targeting?.geo?.countries?.include || [];
  const exc = li.targeting?.geo?.countries?.exclude || [];
  const custom = li.targeting?.geo?.custom || [];
  const parts: string[] = [];
  if (custom.length) parts.push(`${custom.length} custom rule${custom.length > 1 ? "s" : ""}`);
  else parts.push(inc.length ? inc.join(", ") : "All countries");
  if (exc.length) parts.push(`not ${exc.join(", ")}`);
  return parts.join(" · ");
};

// Right-hand summary rail, like the screenshots.
const Rail: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-sm font-medium mt-0.5">{children}</div>
  </div>
);

const CampaignView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campResp, isLoading } = useGetSingleCampaign(id || "");
  const { data: liResp, isLoading: lisLoading } = useLineItems(id);
  const scope = useScope();
  const statusMut = useLineItemStatus();
  const deleteMut = useDeleteLineItem();
  const [toDelete, setToDelete] = useState<LineItem | null>(null);

  const campaign = campResp?.data?.data;
  const lineItems: LineItem[] = liResp?.data?.data ?? [];

  if (isLoading || !campaign) return <LoadingFallback />;

  const advertiser = campaign.advertiser as { id: string; name: string } | null;
  const impressions = campaign.budgetType === "impressions";
  const cur = campaign.currency || "USD";
  const active = lineItems.filter((l) => l.status === "active").length;
  const allocated = lineItems.reduce((s, l) => s + (Number(l.budget) || 0), 0);
  const isLegacy = lineItems.length === 0 && ((campaign.geo || []).length > 0 || (campaign.media || []).length > 0);
  const addHref = `/campaign/view/${id}/line-item/new`;

  // Why it is or isn't bidding: the org's approval, then the super admin's switch.
  const approvalStatus = campaign.approval?.status;
  const bidding =
    approvalStatus === "pending"
      ? "Waiting for approval"
      : approvalStatus === "rejected"
        ? "Rejected by the organization"
        : !campaign.enableBidding
          ? "Waiting for the super admin to turn bidding on"
          : campaign.status === "active"
            ? "On"
            : "Paused";

  return (
    <div className="space-y-5">
      {/* Breadcrumb: Advertisers › Advertiser › Campaign */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap" aria-label="Breadcrumb">
        <Link to="/advertiser/list" className="hover:text-foreground">Advertisers</Link>
        <ChevronRight className="w-3 h-3" />
        {advertiser ? (
          <Link to={`/campaign/list?advertiserId=${advertiser.id}`} className="hover:text-foreground">{advertiser.name}</Link>
        ) : (
          <span>No advertiser</span>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{campaign.title}</span>
      </nav>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {campaign.appIconLink ? (
            <img src={campaign.appIconLink} alt="" className="w-11 h-11 rounded-xl border border-border/60 object-cover shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-xl border border-border/60 bg-muted flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold truncate">{campaign.title}</h1>
              <StatusBadge status={campaign.status} />
              <TypeBadge type={campaign.type} />
              <ApprovalPill approval={campaign.approval} kind="campaign" id={id} resubmit={scope.networkUser} />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {[campaign.appName, campaign.bundleId, campaign.appOs].filter(Boolean).join(" · ") || campaign._id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => navigate(`/campaign/edit/${id}`)}>
            <Pencil className="w-4 h-4" /> Edit campaign
          </Button>
          <Button className="gap-1.5" disabled={!advertiser} onClick={() => navigate(addHref)}>
            <Plus className="w-4 h-4" /> Add line item
          </Button>
        </div>
      </div>

      {!advertiser && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            This campaign has no advertiser yet. <Link to={`/campaign/edit/${id}`} className="font-medium text-primary hover:underline">Edit the campaign</Link> and pick one before adding line items.
          </div>
        </div>
      )}
      {isLegacy && advertiser && (
        <div className="flex items-start gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm">
          <AlertTriangle className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
          <div>
            This campaign still bids with its original targeting and creatives. Once you add a line item, only its
            active line items bid.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-5 items-start">
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Line items</h2>
            <span className="text-xs text-muted-foreground">{active} active of {lineItems.length}</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-5">Name</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Flight</TableHead>
                  <TableHead className="text-right">Budget / Daily</TableHead>
                  <TableHead>Bid</TableHead>
                  <TableHead>Geo</TableHead>
                  <TableHead className="text-right">Creatives</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lisLoading ? (
                  <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">Loading line items…</TableCell></TableRow>
                ) : lineItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">No line items yet. A line item sets who sees the ads, what you bid, and which creatives run.</p>
                      {advertiser && (
                        <Button className="mt-3 gap-1.5" onClick={() => navigate(addHref)}>
                          <Plus className="w-4 h-4" /> Add the first line item
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  lineItems.map((li) => (
                    <TableRow
                      key={li._id}
                      className="cursor-pointer hover:bg-muted/20"
                      onClick={() => navigate(`/campaign/view/${id}/line-item/${li._id}`)}
                    >
                      <TableCell className="pl-5 font-medium max-w-[220px]">
                        <div className="truncate">{li.name}</div>
                        <ApprovalPill approval={li.approval} kind="lineItem" id={li._id} resubmit={scope.networkUser} className="mt-1" />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 capitalize">
                          {li.format === "video" ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          {li.format}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {li.startDate || li.endDate
                          ? `${fmtDate(li.startDate) || "Campaign start"} – ${fmtDate(li.endDate) || "Campaign end"}`
                          : "Campaign dates"}
                      </TableCell>
                      <TableCell className="text-right text-xs whitespace-nowrap tabular-nums">
                        {money(li.budget, cur, impressions)} / {money(li.dailyBudget, cur, impressions)}
                        {li.pacing === "even" && <div className="text-muted-foreground">even pacing</div>}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {li.bidding?.strategy === "fixed_cpm" ? `${li.bidding.cpm} ${cur} CPM` : "Campaign bid"}
                        {li.bidding?.maxCpm ? <div className="text-muted-foreground">max {li.bidding.maxCpm}</div> : null}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{geoSummary(li)}</TableCell>
                      <TableCell className="text-right tabular-nums">{li.creatives?.length || 0}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={li.status === "active"}
                          disabled={statusMut.isPending}
                          aria-label={`Activate ${li.name}`}
                          onCheckedChange={(v) => statusMut.mutate({ id: li._id!, status: v ? "active" : "paused" })}
                        />
                      </TableCell>
                      <TableCell className="text-right pr-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${li.name}`}
                          onClick={() => navigate(`/campaign/view/${id}/line-item/${li._id}`)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Delete ${li.name}`}
                          onClick={() => setToDelete(li)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          {scope.orgLevel && campaign.network && <Rail label="Network">{campaign.network.name}</Rail>}
          <Rail label="Advertiser">{advertiser?.name || "—"}</Rail>
          <Rail label="Bidding">{bidding}</Rail>
          <Rail label="Total budget / Daily">
            {money(campaign.budget, cur, impressions)} / {money(campaign.dailyBudget, cur, impressions)}
          </Rail>
          <Rail label="Allocated to line items">
            {allocated > 0 ? (
              <>
                {money(allocated, cur, impressions)}
                {Number(campaign.budget) > 0 && (
                  <span className="text-muted-foreground font-normal"> of {money(campaign.budget, cur, impressions)}</span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground font-normal">Shared from the campaign budget</span>
            )}
          </Rail>
          <Rail label="Flight">
            {campaign.startDate || campaign.endDate
              ? `${fmtDate(campaign.startDate) || "—"} – ${fmtDate(campaign.endDate) || "No end date"}`
              : "Always on"}
          </Rail>
          <Rail label="Budget type">{impressions ? "Impressions" : "Spend"}</Rail>
          <Rail label="Goal">{campaign.goal || "—"}</Rail>
          <Link to={`/report?campaignIds=${id}&groupBy=campaign,lineItem`} className="text-xs text-primary hover:underline inline-block">
            Performance by line item →
          </Link>
        </Card>
      </div>

      <DeletePopupModal
        isOpen={!!toDelete}
        title={<strong>Delete line item</strong>}
        description={
          <span>
            Delete <strong>{toDelete?.name}</strong>? It stops bidding immediately. Its delivery stays in reports.
          </span>
        }
        cancelButtonAction={() => setToDelete(null)}
        deleteButtonAction={() => {
          if (toDelete?._id) deleteMut.mutate(toDelete._id, { onSuccess: () => setToDelete(null) });
        }}
        isDeleting={deleteMut.isPending}
      />
    </div>
  );
};

export default CampaignView;

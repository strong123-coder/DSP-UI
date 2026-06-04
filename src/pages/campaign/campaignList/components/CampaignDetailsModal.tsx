import React from "react";
import {
  ExternalLink,
  Target,
  Globe,
  Settings,
  DollarSign,
  Clock,
  FileImage,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Campaign } from "../../types";

interface CampaignDetailsModalProps {
  campaign: Campaign | null;
  onClose: () => void;
}

const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({
  campaign,
  onClose,
}) => {
  return (
    <Dialog open={!!campaign} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[85vh] p-6 rounded-2xl">
        {campaign && (
          <div className="space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-3">
                <DialogTitle className="text-xl font-bold font-heading">
                  {campaign.title}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className="capitalize text-sky-500 bg-sky-500/10 border-sky-500/20"
                >
                  {campaign.type}
                </Badge>
                <Badge
                  className={
                    campaign.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }
                  variant="outline"
                >
                  {campaign.status === "active" ? "Active" : "Paused"}
                </Badge>
              </div>
              <DialogDescription>
                Detailed settings and configurations for this advertising
                campaign.
              </DialogDescription>
            </DialogHeader>

            {/* Row 1: Overview & Budget | Scheduling & Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overview & Budget */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-primary" /> Overview &amp;
                  Budget
                </h4>
                <div className="bg-muted/10 border border-border/40 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">App Bundle ID</span>
                    <span className="font-semibold text-foreground">
                      {campaign.bundleId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Campaign Goal</span>
                    <span className="font-semibold text-foreground capitalize">
                      {campaign.goal}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span className="font-semibold text-foreground">
                      ${Number(campaign.budget).toLocaleString()}{" "}
                      {campaign.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Daily Spending Cap
                    </span>
                    <span className="font-semibold text-foreground">
                      ${Number(campaign.dailyBudget).toLocaleString()}{" "}
                      {campaign.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">KPI Goal</span>
                    <span className="font-semibold text-foreground">
                      {campaign.kpi || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scheduling & Target */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" /> Scheduling &amp;
                  Target
                </h4>
                <div className="bg-muted/10 border border-border/40 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Scheduling Enabled
                    </span>
                    <span className="font-semibold text-foreground">
                      {campaign.isScheduling ? "Yes" : "No"}
                    </span>
                  </div>
                  {campaign.isScheduling && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Start Date
                        </span>
                        <span className="font-semibold text-foreground">
                          {campaign.startDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">End Date</span>
                        <span className="font-semibold text-foreground">
                          {campaign.endDate}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Inventory Supply
                    </span>
                    <span className="font-semibold text-foreground capitalize">
                      {campaign.inventoryType?.replace("_", " ")}
                    </span>
                  </div>
                  {campaign.inventoryType === "oem_premium_partners" &&
                    campaign.oemPremiumPartners &&
                    campaign.oemPremiumPartners.length > 0 && (
                      <div className="flex flex-col gap-1 text-sm pt-1">
                        <span className="text-muted-foreground">
                          OEM Partners
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {campaign.oemPremiumPartners.map((oem, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {oem}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Row 2: Geos & Audiences | MMP Tracking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Geos & Audiences */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-primary" /> Geos &amp;
                  Audiences
                </h4>
                <div className="bg-muted/10 border border-border/40 p-4 rounded-xl space-y-3.5">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> Target Regions (
                      {campaign.geo?.length || 0})
                    </span>
                    {campaign.geo && campaign.geo.length > 0 ? (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {campaign.geo.map((geo, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-[10px] uppercase font-bold text-muted-foreground"
                          >
                            {geo}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Global targeting (all regions)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-sm border-t border-border/40 pt-3">
                    <span className="text-muted-foreground">
                      Audience Scope
                    </span>
                    <span className="font-semibold text-foreground capitalize">
                      {campaign.audienceTarget === "custom"
                        ? "Custom Segments"
                        : "All Users"}
                    </span>
                  </div>

                  {campaign.audienceTarget === "custom" &&
                    campaign.customAudienceIds &&
                    campaign.customAudienceIds.length > 0 && (
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground text-xs">
                          Custom Audience IDs
                        </span>
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {campaign.customAudienceIds.map((id, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-[10px] font-mono"
                            >
                              {id}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* MMP Tracking */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-primary" /> MMP Tracking
                </h4>
                <div className="bg-muted/10 border border-border/40 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-semibold text-foreground capitalize">
                      {campaign.mmpPlatform}
                    </span>
                  </div>
                  {campaign.ctaUrl && (
                    <div className="flex flex-col gap-1 text-sm border-t border-border/40 pt-2">
                      <span className="text-muted-foreground flex items-center justify-between">
                        CTA Link
                        <button
                          onClick={() => window.open(campaign.ctaUrl, "_blank")}
                          className="text-primary hover:underline text-[10px] flex items-center gap-0.5 cursor-pointer"
                        >
                          Open <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </span>
                      <p className="text-xs font-mono text-muted-foreground bg-background p-2 border border-border/40 rounded-md break-all max-h-16 overflow-y-auto">
                        {campaign.ctaUrl}
                      </p>
                    </div>
                  )}
                  {campaign.vtaUrl && (
                    <div className="flex flex-col gap-1 text-sm border-t border-border/40 pt-2">
                      <span className="text-muted-foreground flex items-center justify-between">
                        VTA Link
                        <button
                          onClick={() => window.open(campaign.vtaUrl, "_blank")}
                          className="text-primary hover:underline text-[10px] flex items-center gap-0.5 cursor-pointer"
                        >
                          Open <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </span>
                      <p className="text-xs font-mono text-muted-foreground bg-background p-2 border border-border/40 rounded-md break-all max-h-16 overflow-y-auto">
                        {campaign.vtaUrl}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Media Assets */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-primary" /> Campaign Media
                Creatives ({campaign.media?.length || 0})
              </h4>
              {campaign.media && campaign.media.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {campaign.media.map((med, idx) => {
                    const link = med.link || "";
                    const type = med.type || "image";
                    const actualId = med.id || "";

                    return (
                      <div
                        key={idx}
                        className="flex flex-col border border-border/50 bg-background rounded-xl overflow-hidden shadow-2xs group relative"
                      >
                        <div className="aspect-video w-full bg-muted flex items-center justify-center relative overflow-hidden">
                          {type === "video" ? (
                            <video
                              src={link}
                              className="w-full h-full object-cover"
                              controls={false}
                            />
                          ) : (
                            <img
                              src={link}
                              alt="Creative"
                              className="w-full h-full object-cover"
                            />
                          )}
                          <Badge className="absolute top-2 right-2 text-[8px] capitalize">
                            {type}
                          </Badge>
                        </div>
                        <div className="p-2.5 flex items-center justify-between text-xs border-t border-border/30">
                          <span
                            className="font-mono text-[9px] truncate max-w-[130px]"
                            title={actualId}
                          >
                            ID: {actualId}
                          </span>
                          {link && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={() => window.open(link, "_blank")}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/5">
                  No media assets configured for this campaign.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailsModal;

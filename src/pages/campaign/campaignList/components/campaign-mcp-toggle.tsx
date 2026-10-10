import React from "react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSetCampaignMcp } from "@/query/useCampaign";
import type { Campaign } from "../../types";

const STATE: Record<string, { label: string; className: string; hint: string }> = {
  pending: {
    label: "In review",
    className: "bg-amber-100 text-amber-800",
    hint: "Our team is setting up the MCP ad from this campaign's creative.",
  },
  approved: {
    label: "Live",
    className: "bg-emerald-100 text-emerald-800",
    hint: "Serving as a sponsored line inside AI tool results (pay per click).",
  },
  rejected: {
    label: "Not approved",
    className: "bg-red-100 text-red-800",
    hint: "See the review notes.",
  },
};

// Advertiser opt-in to the MCP bidder. Uses the campaign's existing creative
// and CTA; super admin writes the text ad, sets the bid and approves it.
const CampaignMcpToggle: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const { mutate, isPending } = useSetCampaignMcp();
  const on = !!campaign.mcpEnabled;
  const state = on ? STATE[campaign.mcp?.reviewStatus || "pending"] : null;

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Switch
        checked={on}
        disabled={isPending}
        aria-label="Run on MCP"
        onCheckedChange={(enabled) => mutate({ id: campaign._id, enabled })}
      />
      {state && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${state.className}`}>
              {state.label}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px]">
            {campaign.mcp?.reviewNotes || state.hint}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default CampaignMcpToggle;

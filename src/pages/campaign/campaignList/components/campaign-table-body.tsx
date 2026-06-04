import React from "react";
import { MoreVertical } from "lucide-react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Campaign } from "../../types";
import { useNavigate } from "react-router-dom";

interface CampaignTableBodyProps {
  campaigns: Campaign[];
  dataMapping: Record<string, string>;
  onViewCampaign: (campaign: Campaign) => void;
  getDisplayValue: (campaign: Campaign, key: string) => React.ReactNode;
}

const CampaignTableBody: React.FC<CampaignTableBodyProps> = ({
  campaigns,
  dataMapping,
  onViewCampaign,
  getDisplayValue,
}) => {
  const navigate = useNavigate();

  if (campaigns.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={Object.keys(dataMapping).length + 1}
            className="text-center py-12 text-muted-foreground text-sm"
          >
            No campaigns found. Click the floating "+" button to add one.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {campaigns.map((campaign: Campaign) => (
        <TableRow
          key={campaign._id}
          className="hover:bg-muted/20 cursor-pointer transition-colors"
          onClick={() => onViewCampaign(campaign)}
        >
          {Object.keys(dataMapping).map((key) => (
            <TableCell
              key={key}
              className="py-3.5 px-4 text-sm max-w-[200px] truncate"
            >
              {getDisplayValue(campaign, key)}
            </TableCell>
          ))}
          <TableCell
            className="py-3.5 px-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    navigate(`/campaign/edit/${campaign._id}`);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewCampaign(campaign)}>
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

// Reusable inline badge renderer used by getDisplayValue in parent
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <Badge
    className={
      status === "active"
        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"
        : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
    }
    variant="outline"
  >
    {status === "active" ? "Active" : "Paused"}
  </Badge>
);

export const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <Badge
    variant="outline"
    className="capitalize text-sky-500 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/10"
  >
    {type}
  </Badge>
);

export default CampaignTableBody;

import React from "react";
import { useNavigate } from "react-router-dom";
import CampaignListTable from "./components/campaign-list-table";
import AddCampaignButton from "./components/add-campaign-button";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CampaignList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full">
      {/* Campaign List Table (loaded lazily or normally) */}
      <CampaignListTable />

      {/* MCP campaigns: sponsored lines inside AI tool results */}
      <Button
        variant="outline"
        onClick={() => navigate("/campaign/mcp/new")}
        className="fixed bottom-8 right-24 gap-1.5 rounded-full shadow-md bg-background z-50"
      >
        <Sparkles className="w-4 h-4 text-primary" /> New MCP campaign
      </Button>

      {/* Floating Add Campaign Button */}
      <AddCampaignButton onClick={() => navigate("/campaign/add")} />
    </div>
  );
};

export default CampaignList;

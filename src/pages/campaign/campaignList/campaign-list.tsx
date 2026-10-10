import React from "react";
import { useNavigate } from "react-router-dom";
import CampaignListTable from "./components/campaign-list-table";
import AddCampaignButton from "./components/add-campaign-button";

const CampaignList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full">
      {/* Campaign List Table (loaded lazily or normally) */}
      <CampaignListTable />

      {/* Floating Add Campaign Button */}
      <AddCampaignButton onClick={() => navigate("/campaign/add")} />
    </div>
  );
};

export default CampaignList;

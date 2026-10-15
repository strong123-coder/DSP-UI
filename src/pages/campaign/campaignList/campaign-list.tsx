import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CampaignListTable from "./components/campaign-list-table";
import AddCampaignButton from "./components/add-campaign-button";

const CampaignList: React.FC = () => {
  const navigate = useNavigate();
  // When the list is filtered to one advertiser (opened from the Advertisers
  // page), a new campaign starts with that advertiser picked.
  const [params] = useSearchParams();
  const advertiserId = params.get("advertiserId");

  return (
    <div className="h-full w-full">
      {/* Campaign List Table (loaded lazily or normally) */}
      <CampaignListTable />

      {/* Floating Add Campaign Button */}
      <AddCampaignButton onClick={() => navigate(advertiserId ? `/campaign/add?advertiserId=${advertiserId}` : "/campaign/add")} />
    </div>
  );
};

export default CampaignList;

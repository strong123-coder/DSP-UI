import React, { useState, useEffect } from "react";
import { Filter, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import SelectComponent from "@/components/inputComponents/select-component";
import {
  PlatformTypeFilterData,
  CampaignStatusFilterData,
} from "@/utils/data/campaignData";

interface FilterData {
  search?: string;
  type?: string;
  status?: string;
}

interface CampaignFilterProps {
  filterData: FilterData;
  setFilterData: React.Dispatch<React.SetStateAction<FilterData>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const CampaignFilter: React.FC<CampaignFilterProps> = ({
  filterData,
  setFilterData,
  setPage,
}) => {
  // Local temporary states for the filter options (default to " " representing All)
  const [type, setType] = useState(" ");
  const [status, setStatus] = useState(" ");

  // Synchronize local states when parent state changes (e.g. initial loads or reset)
  useEffect(() => {
    setType(filterData?.type || " ");
    setStatus(filterData?.status || " ");
  }, [filterData]);

  const handleApplyFilter = () => {
    setFilterData((prev) => {
      const updated = { ...prev };

      const cleanType = type.trim();
      if (cleanType !== "") {
        updated.type = cleanType;
      } else {
        delete updated.type;
      }

      const cleanStatus = status.trim();
      if (cleanStatus !== "") {
        updated.status = cleanStatus;
      } else {
        delete updated.status;
      }

      return updated;
    });
    setPage(1);
  };

  const handleCancelFilter = () => {
    setType(filterData?.type || " ");
    setStatus(filterData?.status || " ");
  };

  const resetFilterComponent = () => {
    setPage(1);
    setType(" ");
    setStatus(" ");
    setFilterData((prev) => {
      const updated = { ...prev };
      delete updated.type;
      delete updated.status;
      return updated;
    });
  };

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          aria-label="Open filter drawer"
          className="fixed bottom-6 right-24 h-14 w-14 rounded-full bg-muted border border-border text-foreground hover:bg-muted/80 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer z-50 animate-in fade-in zoom-in-50"
        >
          <Filter
            strokeWidth={2}
            className="transition-transform duration-300 w-6 h-6 text-foreground"
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-0">
        <DrawerHeader className="border-b border-border/40 pb-4">
          <DrawerTitle className="flex justify-between items-center px-4">
            <span className="text-lg font-bold">Campaign Filters</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetFilterComponent}
              title="Reset Filters"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </DrawerTitle>
          <DrawerDescription className="px-4">
            Filter campaigns by platform type or active status.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Platform Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="campaign-type">Platform Type</Label>
            <SelectComponent
              id="campaign-type"
              placeholder="Select Platform"
              data={PlatformTypeFilterData}
              value={type === "" ? undefined : type}
              onValueChange={setType}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="campaign-status">Campaign Status</Label>
            <SelectComponent
              id="campaign-status"
              placeholder="Select Status"
              data={CampaignStatusFilterData}
              value={status === "" ? undefined : status}
              onValueChange={setStatus}
            />
          </div>
        </div>

        <DrawerFooter className="border-t border-border/40 p-6 flex flex-col gap-2">
          <DrawerClose asChild>
            <Button onClick={handleApplyFilter}>
              Apply Filters <Filter className="w-4 h-4" />
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button variant="outline" onClick={handleCancelFilter}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CampaignFilter;

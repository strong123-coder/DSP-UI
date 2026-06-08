import React, { useState, useEffect, useMemo } from "react";
import { Compass, LayoutGrid, Search, Filter, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetCampaignOptions } from "@/query/useCampaign";
import { groupByOptions } from "../constants";

interface FilterData {
  campaignIds?: string[];
  groupBy?: string[];
}

interface ReportFilterProps {
  filterData: FilterData;
  setFilterData: React.Dispatch<React.SetStateAction<FilterData>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const ReportFilter: React.FC<ReportFilterProps> = ({
  filterData,
  setFilterData,
  setPage,
}) => {
  const [open, setOpen] = useState(false);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [groupBySearch, setGroupBySearch] = useState("");
  const [localCampaignIds, setLocalCampaignIds] = useState<string[]>([]);
  const [localGroupBy, setLocalGroupBy] = useState<string[]>(["campaign"]);

  // Fetch campaign options for the filter
  const { data: campaignsResponse } = useGetCampaignOptions(open);

  const campaignOptions = useMemo(() => {
    return (campaignsResponse?.data as Array<{ id: string; value: string }>) ?? [];
  }, [campaignsResponse]);

  const filteredCampaigns = useMemo(() => {
    return campaignOptions.filter((c) =>
      c.value.toLowerCase().includes(campaignSearch.toLowerCase())
    );
  }, [campaignOptions, campaignSearch]);

  const filteredGroupByOptions = useMemo(() => {
    return groupByOptions.filter((opt) =>
      opt.label.toLowerCase().includes(groupBySearch.toLowerCase())
    );
  }, [groupBySearch]);

  // Sync local states with parent filters when drawer opens or updates
  useEffect(() => {
    if (open) {
      setLocalCampaignIds(filterData.campaignIds || []);
      setLocalGroupBy(filterData.groupBy || ["campaign"]);
      setCampaignSearch("");
      setGroupBySearch("");
    }
  }, [open, filterData]);

  const handleApply = () => {
    setFilterData({
      campaignIds: localCampaignIds,
      groupBy: localGroupBy,
    });
    setPage(1);
  };

  const handleCancel = () => {
    setLocalCampaignIds(filterData.campaignIds || []);
    setLocalGroupBy(filterData.groupBy || ["campaign"]);
  };

  const handleClear = () => {
    setLocalCampaignIds([]);
    setLocalGroupBy(["campaign"]);
    setFilterData({
      campaignIds: [],
      groupBy: ["campaign"],
    });
    setPage(1);
  };

  const isAllSelected = useMemo(() => {
    if (campaignOptions.length === 0) return false;
    return campaignOptions.every((c) => localCampaignIds.includes(c.id));
  }, [campaignOptions, localCampaignIds]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setLocalCampaignIds(campaignOptions.map((c) => c.id));
    } else {
      setLocalCampaignIds([]);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          aria-label="Open filter drawer"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-muted border border-border text-foreground hover:bg-muted/80 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer z-50 animate-in fade-in zoom-in-50"
        >
          <Filter
            strokeWidth={2}
            className="transition-transform duration-300 w-6 h-6 text-foreground"
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-0 flex flex-col h-full bg-card border-l border-border max-w-sm w-full">
        {/* Header section with Reset button */}
        <DrawerHeader className="border-b border-border/40 pb-4">
          <DrawerTitle className="flex justify-between items-center px-4 pt-4">
            <span className="text-lg font-bold">Report Filters</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              title="Reset Filters"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </DrawerTitle>
          <DrawerDescription className="px-4">
            Filter reports by campaign or group by dimensions.
          </DrawerDescription>
        </DrawerHeader>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <Accordion type="multiple" className="w-full space-y-2">
            {/* Campaign Select item */}
            <AccordionItem value="campaign" className="border-b border-border/40 pb-2">
              <AccordionTrigger className="py-2 hover:no-underline font-semibold text-sm flex items-center gap-2.5 text-foreground">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" />
                  <span>Campaign</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 pb-2 px-1">
                <div className="relative w-full mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search"
                    className="pl-9 pr-4 h-9 bg-card border-border/60 text-sm rounded-lg"
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 mt-2 px-1">
                  {campaignOptions.length > 0 && (
                    <label className="flex items-center gap-3 py-1.5 px-2 hover:bg-muted/40 rounded-lg cursor-pointer transition-colors text-sm font-medium text-foreground">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      />
                      <span>Select All</span>
                    </label>
                  )}
                  {filteredCampaigns.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 py-1.5 px-2 hover:bg-muted/40 rounded-lg cursor-pointer transition-colors text-sm font-medium text-foreground"
                    >
                      <Checkbox
                        checked={localCampaignIds.includes(c.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setLocalCampaignIds((prev) => [...prev, c.id]);
                          } else {
                            setLocalCampaignIds((prev) => prev.filter((id) => id !== c.id));
                          }
                        }}
                      />
                      <span className="truncate">{c.value}</span>
                    </label>
                  ))}
                  {filteredCampaigns.length === 0 && (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      No campaigns found
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Group By item */}
            <AccordionItem value="groupBy" className="border-b border-border/40 pb-2">
              <AccordionTrigger className="py-2 hover:no-underline font-semibold text-sm flex items-center gap-2.5 text-foreground">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  <span>Group By</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 pb-2 px-1">
                <div className="relative w-full mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search"
                    className="pl-9 pr-4 h-9 bg-card border-border/60 text-sm rounded-lg"
                    value={groupBySearch}
                    onChange={(e) => setGroupBySearch(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 mt-2 px-1">
                  {filteredGroupByOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 py-1.5 px-2 hover:bg-muted/40 rounded-lg cursor-pointer transition-colors text-sm font-medium text-foreground"
                    >
                      <Checkbox
                        checked={localGroupBy.includes(opt.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setLocalGroupBy((prev) => [...prev, opt.value]);
                          } else {
                            setLocalGroupBy((prev) => prev.filter((val) => val !== opt.value));
                          }
                        }}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                  {filteredGroupByOptions.length === 0 && (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      No options found
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Footer buttons */}
        <DrawerFooter className="border-t border-border/40 p-6 flex flex-col gap-2 shrink-0">
          <DrawerClose asChild>
            <Button onClick={handleApply}>
              Apply Filters <Filter className="w-4 h-4" />
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ReportFilter;

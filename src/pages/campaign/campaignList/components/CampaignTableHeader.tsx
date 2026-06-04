import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SortDirection } from "../../types";

interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface CampaignTableHeaderProps {
  dataMapping: Record<string, string>;
  sortConfig: SortConfig | null;
  sortableKeys: Set<string>;
  onSort: (key: string) => void;
}

const CampaignTableHeader: React.FC<CampaignTableHeaderProps> = ({
  dataMapping,
  sortConfig,
  sortableKeys,
  onSort,
}) => {
  return (
    <TableHeader className="bg-muted/30">
      <TableRow>
        {Object.entries(dataMapping).map(([key, label]) => {
          const isSortable = sortableKeys.has(key);
          const isActive = sortConfig?.key === key;

          return (
            <TableHead
              key={key}
              className={`px-4 py-3 ${isSortable ? "cursor-pointer select-none" : ""}`}
              onClick={() => onSort(key)}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                <span>{label}</span>
                {isSortable && (
                  <div className="flex flex-col leading-none">
                    <ChevronUp
                      className={`h-3 w-3 ${
                        isActive && sortConfig?.direction === "asc"
                          ? "text-primary"
                          : "text-muted-foreground/30"
                      }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 -mt-1 ${
                        isActive && sortConfig?.direction === "desc"
                          ? "text-primary"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </div>
                )}
              </div>
            </TableHead>
          );
        })}
        <TableHead className="px-4 py-3 text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CampaignTableHeader;

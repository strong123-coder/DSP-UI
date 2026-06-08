import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SortDirection } from "../types";

interface SortConfig {
  by: string;
  order: SortDirection;
}

interface ReportTableHeaderProps {
  activeHeaders: Array<{ key: string; label: string; sortable: boolean }>;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

const ReportTableHeader: React.FC<ReportTableHeaderProps> = ({
  activeHeaders,
  sortConfig,
  onSort,
}) => {
  return (
    <TableHeader className="bg-muted/30">
      <TableRow>
        {activeHeaders.map((col) => {
          const isSortable = col.sortable;
          const isActive = isSortable && sortConfig.by === col.key;
          return (
            <TableHead
              key={col.key}
              className={`px-4 py-3 select-none ${isSortable ? "cursor-pointer" : "cursor-default"}`}
              onClick={() => isSortable && onSort(col.key)}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                <span>{col.label}</span>
                {isSortable && (
                  <div className="flex flex-col leading-none">
                    <ChevronUp
                      className={`h-3 w-3 ${isActive && sortConfig.order === "asc"
                        ? "text-primary"
                        : "text-muted-foreground/30"
                      }`}
                    />
                    <ChevronDown
                      className={`h-3 w-3 -mt-1 ${isActive && sortConfig.order === "desc"
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
      </TableRow>
    </TableHeader>
  );
};

export default ReportTableHeader;

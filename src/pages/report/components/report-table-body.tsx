import React from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { ReportDataRow, ReportTotals } from "../types";

// Metric columns (everything else is a dimension / label column).
const METRIC_KEYS = new Set([
  "impressions",
  "clicks",
  "installs",
  "events",
  "ctr",
  "spent",
  "cpi",
  "cpc",
]);

interface ReportTableBodyProps {
  reportData: ReportDataRow[];
  activeHeaders: Array<{ key: string; label: string; sortable: boolean }>;
  totals: ReportTotals | null;
  renderCell: (row: ReportDataRow, key: string) => React.ReactNode;
}

const ReportTableBody: React.FC<ReportTableBodyProps> = ({
  reportData,
  activeHeaders,
  totals,
  renderCell,
}) => {
  return (
    <TableBody>
      {reportData.length === 0 ? (
        <TableRow>
          <TableCell colSpan={activeHeaders.length} className="text-center py-12 text-sm text-muted-foreground">
            No records found
          </TableCell>
        </TableRow>
      ) : (
        reportData.map((row, index) => (
          <TableRow key={index} className="hover:bg-muted/20">
            {activeHeaders.map((col) => (
              <TableCell key={col.key} className="py-3.5 px-4 text-sm max-w-[200px] truncate">
                {renderCell(row, col.key)}
              </TableCell>
            ))}
          </TableRow>
        ))
      )}

      {/* Total Row — reuse renderCell for metric columns; first col shows TOTAL. */}
      {totals && reportData.length > 0 && (
        <TableRow className="bg-muted/10 font-bold border-t-2 border-border/60 hover:bg-muted/10">
          {activeHeaders.map((col, idx) => {
            if (idx === 0) {
              return (
                <TableCell key={col.key} className="py-3.5 px-4 text-sm text-foreground uppercase tracking-wider font-bold">
                  TOTAL:
                </TableCell>
              );
            }
            return (
              <TableCell key={col.key} className="py-3.5 px-4 text-sm text-foreground font-bold">
                {METRIC_KEYS.has(col.key)
                  ? renderCell(totals as unknown as ReportDataRow, col.key)
                  : "-"}
              </TableCell>
            );
          })}
        </TableRow>
      )}
    </TableBody>
  );
};

export default ReportTableBody;

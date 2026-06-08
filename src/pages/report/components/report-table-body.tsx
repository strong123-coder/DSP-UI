import React from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { ReportDataRow, ReportTotals } from "../types";

interface ReportTableBodyProps {
  reportData: ReportDataRow[];
  activeHeaders: Array<{ key: string; label: string; sortable: boolean }>;
  totals: ReportTotals | null;
  renderCell: (row: ReportDataRow, key: string) => React.ReactNode;
  formatClicks: (val: number) => string;
  formatInstalls: (val: number) => string;
  formatCtr: (val: number) => string;
  formatSpent: (val: number) => string;
}

const ReportTableBody: React.FC<ReportTableBodyProps> = ({
  reportData,
  activeHeaders,
  totals,
  renderCell,
  formatClicks,
  formatInstalls,
  formatCtr,
  formatSpent,
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

      {/* Total Row */}
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

            const val = totals[col.key as keyof typeof totals];
            if (col.key === "advertiser") {
              return (
                <TableCell key={col.key} className="py-3.5 px-4 text-sm text-foreground font-bold">
                  -
                </TableCell>
              );
            }
            if (col.key === "clicks") {
              return (
                <TableCell key={col.key} className="py-3.5 px-4 text-sm text-foreground font-bold">
                  {formatClicks(val as number)}
                </TableCell>
              );
            }
            if (col.key === "installs") {
              return (
                <TableCell key={col.key} className="py-3.5 px-4 text-sm text-foreground font-bold">
                  {formatInstalls(val as number)}
                </TableCell>
              );
            }
            if (col.key === "ctr") {
              return (
                <TableCell key={col.key} className="py-3.5 px-4 text-sm text-foreground font-bold">
                  {formatCtr(val as number)}
                </TableCell>
              );
            }
            if (col.key === "spent") {
              return (
                <TableCell key={col.key} className="py-3.5 px-4 text-sm text-foreground font-bold">
                  {formatSpent(val as number)}
                </TableCell>
              );
            }
            return (
              <TableCell key={col.key} className="py-3.5 px-4 text-sm text-foreground font-bold">
                -
              </TableCell>
            );
          })}
        </TableRow>
      )}
    </TableBody>
  );
};

export default ReportTableBody;

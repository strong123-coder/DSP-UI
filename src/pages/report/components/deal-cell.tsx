import React from "react";

// Deal name (with seller) above its id; the open auction and deals that aren't
// set up on a supply partner show just what is known.
const DealCell: React.FC<{ row: Record<string, any> }> = ({ row }) => {
  if (!row.deal) return <span className="text-muted-foreground">{row.dealName || "Open auction"}</span>;
  return (
    <div className="min-w-0" title={row.deal}>
      <div className="font-medium truncate">{row.dealName || row.deal}</div>
      {(row.dealName || row.dealPartner) && (
        <div className="text-[11px] text-muted-foreground truncate">
          {[row.dealName ? row.deal : null, row.dealPartner].filter(Boolean).join(" · ")}
        </div>
      )}
    </div>
  );
};

export default DealCell;

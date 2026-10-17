import React from "react";
import { Clock, RotateCcw, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useResubmit } from "@/query/useApproval";
import type { Approval, ApprovalKind } from "@/services/approval";
import { changeText } from "@/utils/approval";

// Shows where an item stands with the org's approval. Approved (or no
// approval, as on older items) shows nothing. A rejected item can be sent
// back as it is with `resubmit`.
const ApprovalPill: React.FC<{
  approval?: Approval | null;
  kind?: ApprovalKind;
  id?: string;
  resubmit?: boolean;
  className?: string;
}> = ({ approval, kind, id, resubmit, className = "" }) => {
  const resubmitMut = useResubmit();
  const status = approval?.status;
  if (status !== "pending" && status !== "rejected") return null;

  if (status === "pending") {
    const changed = changeText(approval?.changes);
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200 whitespace-nowrap ${className}`}>
            <Clock className="w-3 h-3" /> Awaiting approval
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {changed ? `Changed: ${changed}. ` : ""}It doesn't bid until your organization approves it.
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 whitespace-nowrap">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {approval?.note ? `"${approval.note}". ` : ""}Change it and save, or send it back as it is.
        </TooltipContent>
      </Tooltip>
      {resubmit && kind && id && (
        <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1" disabled={resubmitMut.isPending}
          onClick={(e) => {
            e.stopPropagation();
            resubmitMut.mutate({ kind, id });
          }}>
          <RotateCcw className="w-3 h-3" /> Send for approval
        </Button>
      )}
    </span>
  );
};

export default ApprovalPill;

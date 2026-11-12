import type { SegmentStatus } from "@/services/segment";

export const SEGMENT_STATUS_LABEL: Record<SegmentStatus, string> = {
  live: "Live",
  needs_data: "Needs data",
  not_offered: "Not offered",
};

// 160 → "160 Mn", 2.5 → "2.5 Mn".
export const reachText = (mn?: number | null) => (mn == null ? "—" : `${mn >= 10 ? Math.round(mn) : mn} Mn`);

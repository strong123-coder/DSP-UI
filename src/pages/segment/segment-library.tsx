import React from "react";
import { UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SegmentBrowser from "@/components/segment/segment-browser";
import { useSegmentFacets } from "@/query/useSegment";
import type { SegmentFacets } from "@/services/segment";

const day = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

const Stat: React.FC<{ label: string; value: number | string; hint?: string; tone?: string }> = ({ label, value, hint, tone = "" }) => (
  <div className="rounded-lg border border-border px-4 py-3 min-w-0">
    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className={`text-2xl font-semibold tabular-nums ${tone}`}>{value}</div>
    {hint && <div className="text-[11px] text-muted-foreground truncate" title={hint}>{hint}</div>}
  </div>
);

// Library › Audience segments: every segment line items can target, and the
// ones that can't be yet, with why.
const SegmentLibrary: React.FC = () => {
  const { data } = useSegmentFacets("IN");
  const f: SegmentFacets | undefined = data?.data?.data;
  const c = f?.catalog;

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><UsersRound className="w-5 h-5 text-primary" /> Audience segments</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Segments you can add to a line item under Targeting › Segments. Live ones bid today; the rest are planned and
          show what data they still need.
          {c?.updatedAt && <> Catalog loaded {day(c.updatedAt)}{c.fileName ? ` from ${c.fileName}` : ""}{c.baseMn ? `, reach on a base of ${c.baseMn} Mn monthly devices` : ""}.</>}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Live in our catalog" value={c?.live ?? "—"} hint={c ? `of ${c.total} segments` : undefined} tone="text-emerald-700 dark:text-emerald-400" />
        <Stat label="Needs data" value={c?.needsData ?? "—"} hint="app usage, models, partners" tone="text-amber-700 dark:text-amber-300" />
        <Stat label="Not offered" value={c?.notOffered ?? "—"} hint="sensitive or may reach children" />
        <Stat label="Exchange (IAB)" value={f?.iab.live ?? "—"} hint={f ? `live of ${f.iab.total}, segtax ${f.iab.segtax}` : undefined} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <SegmentBrowser />
        </CardContent>
      </Card>
    </div>
  );
};

export default SegmentLibrary;

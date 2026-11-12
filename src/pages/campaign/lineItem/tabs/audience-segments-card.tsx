import React from "react";
import { Link } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { UsersRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SelectedChips from "@/components/targeting/selected-chips";
import SegmentBrowser from "@/components/segment/segment-browser";
import { SEGMENT_STATUS_LABEL } from "@/utils/segment";
import { useSegmentResolve } from "@/query/useSegment";
import type { Segment } from "@/services/segment";
import type { LineItemFormValues } from "@/utils/schemas/lineItem";

const dirty = { shouldDirty: true };

// Line item › Targeting › Segments: audience segments from the catalog or
// the exchange, saved as targeting.segments.audiences.
const AudienceSegmentsCard: React.FC = () => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const value = watch("targeting.segments.audiences");
  const keys = [...value.include, ...value.exclude];
  const { data } = useSegmentResolve(keys);
  const byKey = new Map<string, Segment>((data?.data?.data ?? []).map((s: Segment) => [s.key, s]));
  const label = (k: string) => {
    const s = byKey.get(k);
    if (!s) return k;
    return s.status === "live" ? s.name : `${s.name} (${s.status ? SEGMENT_STATUS_LABEL[s.status] : "removed"})`;
  };
  // Saved segments that are no longer live match nobody.
  const stale = keys.map((k) => byKey.get(k)).filter((s): s is Segment => !!s && s.status !== "live");

  const save = (v: { include: string[]; exclude: string[] }) => setValue("targeting.segments.audiences", v, dirty);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-primary"><UsersRound className="w-4 h-4" /></span> Audience segments
        </CardTitle>
        <CardDescription>
          With includes, the line item bids only on people in at least one of them; excludes block anyone in them. Browse
          every segment under <Link to="/segments" className="underline underline-offset-2 hover:text-foreground">Library › Audience segments</Link>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SelectedChips include={value.include} exclude={value.exclude} label={label} empty="No segments: anyone eligible can see the ads."
          onRemove={(k, side) => save({ ...value, [side]: value[side].filter((x) => x !== k) })} />
        {stale.length > 0 && (
          <p className="text-xs rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 px-3 py-2">
            {stale.map((s) => s.name).join(", ")} {stale.length === 1 ? "is" : "are"} no longer live, so{" "}
            {stale.length === 1 ? "it matches" : "they match"} nobody. Remove {stale.length === 1 ? "it" : "them"}
            {value.include.some((k) => stale.some((s) => s.key === k)) ? "; an include of only such segments stops the line item bidding" : ""}.
          </p>
        )}
        <SegmentBrowser value={value} onChange={save} />
      </CardContent>
    </Card>
  );
};

export default AudienceSegmentsCard;

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectComponent from "@/components/inputComponents/select-component";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useAdvertiserOptions } from "@/query/useAdvertiser";
import { useBidModifier, useCreateBidModifier, useModifierFields, useUpdateBidModifier } from "@/query/useBidModifier";
import { multiplierText } from "@/utils/bidModifier";
import type { ModifierField } from "@/services/bidModifier";
import TermsEditor, { fromApiTerms, termsError, toApiTerms, type TermRow } from "@/components/modifiers/terms-editor";

const MULTIPLIER = {
  label: "Then multiply the bid by",
  min: 0,
  max: 10,
  step: "0.05",
  initial: "1.2",
  name: "multiplier",
  preview: (n: number) => ({ text: multiplierText(n), tone: n === 0 ? ("bad" as const) : n > 1 ? ("good" as const) : undefined }),
};

const BidModifierForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { data: resp, isLoading } = useBidModifier(id);
  const { data: advResp } = useAdvertiserOptions();
  const advertisers: Array<{ id: string; value: string }> = advResp?.data ?? [];
  const { data: fieldResp } = useModifierFields();
  const fields: ModifierField[] = fieldResp?.data ?? [];
  const createMut = useCreateBidModifier();
  const updateMut = useUpdateBidModifier();

  const [advertiserId, setAdvertiserId] = useState(search.get("advertiserId") || "");
  const [name, setName] = useState("");
  const [minBid, setMinBid] = useState("");
  const [maxBid, setMaxBid] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState<TermRow[]>([]);

  const mod = resp?.data?.data;
  useEffect(() => {
    if (!mod) return;
    setAdvertiserId(mod.advertiserId);
    setName(mod.name || "");
    setMinBid(mod.minBid ? String(mod.minBid) : "");
    setMaxBid(mod.maxBid ? String(mod.maxBid) : "");
    setNotes(mod.notes || "");
    setTerms(fromApiTerms(mod.terms, "multiplier"));
  }, [mod]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advertiserId) return toast.error("Pick the advertiser this modifier belongs to");
    if (!name.trim()) return toast.error("Give the bid modifier a name");
    const err = termsError(terms, fields, MULTIPLIER);
    if (err) return toast.error(err);
    const payload = {
      name: name.trim(),
      minBid: minBid ? Number(minBid) : null,
      maxBid: maxBid ? Number(maxBid) : null,
      notes: notes.trim() || null,
      terms: toApiTerms(terms, "multiplier"),
    };
    const done = () => navigate(`/bid-modifier/list?advertiserId=${advertiserId}`);
    if (isEdit) updateMut.mutate({ id: id!, payload }, { onSuccess: done });
    else createMut.mutate({ ...payload, advertiserId }, { onSuccess: done });
  };

  if (isEdit && isLoading) return <LoadingFallback />;
  const saving = createMut.isPending || updateMut.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-24 max-w-5xl">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/bid-modifier/list" className="hover:text-foreground">Bid modifiers</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{isEdit ? mod?.name || "Edit" : "New bid modifier"}</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bid modifier</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bm-advertiser">Advertiser <span className="text-destructive">*</span></Label>
            <SelectComponent id="bm-advertiser" search value={advertiserId} disabled={isEdit} placeholder="Select advertiser"
              data={advertisers.map((a) => ({ name: a.value, value: String(a.id) }))} onValueChange={setAdvertiserId} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bm-name">Name <span className="text-destructive">*</span></Label>
            <Input id="bm-name" value={name} maxLength={120} placeholder="e.g. Top apps +20%, nights off" onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bm-min">Min bid (CPM)</Label>
            <Input id="bm-min" type="number" min="0" step="0.01" placeholder="No minimum" value={minBid} onChange={(e) => setMinBid(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bm-max">Max bid (CPM)</Label>
            <Input id="bm-max" type="number" min="0" step="0.01" placeholder="No maximum" value={maxBid} onChange={(e) => setMaxBid(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bm-notes">Notes</Label>
            <Input id="bm-notes" value={notes} maxLength={2000} placeholder="What this modifier is for" onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <TermsEditor terms={terms} onChange={setTerms} fields={fields} value={MULTIPLIER}
        description="Checked top to bottom; the first term whose conditions all match sets the multiplier. A multiplier of 0 means don't bid. Requests that match no term keep the normal bid."
        empty="No terms: only the min and max bid apply." />

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-6 py-3 flex items-center gap-3 justify-end z-20">
        <Button type="button" variant="outline" onClick={() => navigate("/bid-modifier/list")} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save bid modifier" : "Create bid modifier"}</Button>
      </div>
    </form>
  );
};

export default BidModifierForm;

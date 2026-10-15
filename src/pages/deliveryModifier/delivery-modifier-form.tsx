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
import TermsEditor, { fromApiTerms, termsError, toApiTerms, type TermRow } from "@/components/modifiers/terms-editor";
import { useAdvertiserOptions } from "@/query/useAdvertiser";
import { useModifierFields } from "@/query/useBidModifier";
import { useCreateDeliveryModifier, useDeliveryModifier, useUpdateDeliveryModifier } from "@/query/useDeliveryModifier";
import type { ModifierField } from "@/services/bidModifier";

const SHARE = {
  label: "Then bid on",
  min: 0,
  max: 100,
  step: "1",
  suffix: "%",
  initial: "50",
  name: "share",
  preview: (n: number) => ({
    text: n <= 0 ? "of them: never" : n >= 100 ? "of them: no limit" : "of matching requests",
    tone: n <= 0 ? ("bad" as const) : undefined,
  }),
};

const DeliveryModifierForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { data: resp, isLoading } = useDeliveryModifier(id);
  const { data: advResp } = useAdvertiserOptions();
  const advertisers: Array<{ id: string; value: string }> = advResp?.data ?? [];
  const { data: fieldResp } = useModifierFields();
  const fields: ModifierField[] = fieldResp?.data ?? [];
  const createMut = useCreateDeliveryModifier();
  const updateMut = useUpdateDeliveryModifier();

  const [advertiserId, setAdvertiserId] = useState(search.get("advertiserId") || "");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState<TermRow[]>([]);

  const mod = resp?.data?.data;
  useEffect(() => {
    if (!mod) return;
    setAdvertiserId(mod.advertiserId);
    setName(mod.name || "");
    setNotes(mod.notes || "");
    setTerms(fromApiTerms(mod.terms, "share"));
  }, [mod]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advertiserId) return toast.error("Pick the advertiser this modifier belongs to");
    if (!name.trim()) return toast.error("Give the delivery modifier a name");
    const err = termsError(terms, fields, SHARE);
    if (err) return toast.error(err);
    const payload = { name: name.trim(), notes: notes.trim() || null, terms: toApiTerms(terms, "share") };
    const done = () => navigate(`/delivery-modifier/list?advertiserId=${advertiserId}`);
    if (isEdit) updateMut.mutate({ id: id!, payload }, { onSuccess: done });
    else createMut.mutate({ ...payload, advertiserId }, { onSuccess: done });
  };

  if (isEdit && isLoading) return <LoadingFallback />;
  const saving = createMut.isPending || updateMut.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-24 max-w-5xl">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/delivery-modifier/list" className="hover:text-foreground">Delivery modifiers</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{isEdit ? mod?.name || "Edit" : "New delivery modifier"}</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery modifier</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dm-advertiser">Advertiser <span className="text-destructive">*</span></Label>
            <SelectComponent id="dm-advertiser" search value={advertiserId} disabled={isEdit} placeholder="Select advertiser"
              data={advertisers.map((a) => ({ name: a.value, value: String(a.id) }))} onValueChange={setAdvertiserId} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dm-name">Name <span className="text-destructive">*</span></Label>
            <Input id="dm-name" value={name} maxLength={120} placeholder="e.g. Throttle long-tail apps, half on weekends"
              onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="dm-notes">Notes</Label>
            <Input id="dm-notes" value={notes} maxLength={2000} placeholder="What this modifier is for" onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <TermsEditor terms={terms} onChange={setTerms} fields={fields} value={SHARE}
        description="Checked top to bottom; the first term whose conditions all match sets the share of those requests the line item bids on (0% = never). Requests that match no term are always bid on. It changes how often the line item bids, not what it bids."
        empty="No terms: the line item bids on every eligible request." />

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-6 py-3 flex items-center gap-3 justify-end z-20">
        <Button type="button" variant="outline" onClick={() => navigate("/delivery-modifier/list")} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save delivery modifier" : "Create delivery modifier"}</Button>
      </div>
    </form>
  );
};

export default DeliveryModifierForm;

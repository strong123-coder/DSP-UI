import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import type { PartnerDeal, DealTerm } from "@/services/mediation";

export const DEAL_MODELS = [
  { v: "margin", l: "Margin — % cut on eCPM" },
  { v: "revshare", l: "Rev share — % of revenue we keep" },
];

const DEAL_TYPES = [
  { v: "preferred", l: "Preferred (fixed CPM, first look)" },
  { v: "private_auction", l: "Private auction (floor, invite-only)" },
  { v: "programmatic_guaranteed", l: "Programmatic guaranteed (fixed + volume)" },
];

const AUCTION_TYPES = [
  { v: 1, l: "1 — First price" },
  { v: 2, l: "2 — Second price" },
  { v: 3, l: "3 — Fixed (deal price)" },
];

const csv = (a?: (string | number)[]) => (a || []).join(", ");
const fromCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

/** Commercial deal — revshare OR margin. Same card on demand and supply forms. */
export const CommercialDealFields: React.FC<{
  deal: PartnerDeal | undefined;
  onChange: (deal: PartnerDeal) => void;
  showFloor?: boolean; // supply: partner-level default floor
  extra?: React.ReactNode; // e.g. demand's Traffic % field
}> = ({ deal, onChange, showFloor, extra }) => {
  const d: PartnerDeal = { model: "margin", marginPct: 0, ...(deal || {}) };
  const set = (patch: Partial<PartnerDeal>) => onChange({ ...d, ...patch });
  const isRevshare = d.model === "revshare";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-1.5 col-span-2">
        <Label>Deal model</Label>
        <Select value={d.model} onValueChange={(v) => set({ model: v as PartnerDeal["model"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{DEAL_MODELS.map((m) => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {isRevshare ? (
        <div className="space-y-1.5">
          <Label>Rev share % <span className="text-destructive">*</span></Label>
          <Input type="number" min={0} max={100} value={d.revSharePct ?? ""} placeholder="70"
            onChange={(e) => set({ revSharePct: e.target.value === "" ? null : Number(e.target.value) })} />
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label>Margin %</Label>
            <Input type="number" min={0} max={100} value={d.marginPct ?? 0}
              onChange={(e) => set({ marginPct: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label>Min margin CPM</Label>
            <Input type="number" min={0} step="0.01" value={d.minMarginCpm ?? ""} placeholder="optional"
              onChange={(e) => set({ minMarginCpm: e.target.value === "" ? null : Number(e.target.value) })} />
          </div>
        </>
      )}
      <div className="space-y-1.5">
        <Label>Bid adjust %</Label>
        <Input type="number" value={d.bidAdjustPct ?? 0}
          onChange={(e) => set({ bidAdjustPct: Number(e.target.value) })} />
      </div>
      {showFloor && (
        <div className="space-y-1.5">
          <Label>Default floor CPM</Label>
          <Input type="number" min={0} step="0.01" value={d.floorCpm ?? ""} placeholder="optional"
            onChange={(e) => set({ floorCpm: e.target.value === "" ? null : Number(e.target.value) })} />
        </div>
      )}
      {extra}
      <p className="col-span-2 md:col-span-4 text-xs text-muted-foreground">
        {isRevshare
          ? "Rev share: bids pass through unmodified; settlement is a billing-time split — we keep the configured % of the revenue this partner generates."
          : "Margin: the cut is taken in the bid price at auction time — partner bids P, we forward P × (1 − margin) and keep the difference."}
      </p>
    </div>
  );
};

const emptyDealTerm = (): DealTerm => ({
  dealId: "", name: "", type: "private_auction", status: "active", auctionType: 2,
  fixedCpm: null, floorCpm: null, currency: "USD", wseat: [], marginPctOverride: null,
  startDate: null, endDate: null, volumeGoal: null,
});

/** PMP Deal IDs — dynamic array editor, same on demand and supply forms. */
export const DealTermsEditor: React.FC<{
  deals: DealTerm[] | undefined;
  onChange: (deals: DealTerm[]) => void;
}> = ({ deals, onChange }) => {
  const rows = deals || [];
  const set = (idx: number, patch: Partial<DealTerm>) => {
    const next = [...rows];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No PMP deals. Open-auction traffic works without any — add a deal only when you've negotiated one offline with this partner.
        </p>
      )}
      {rows.map((dl, i) => {
        const isFixed = dl.type === "preferred" || dl.type === "programmatic_guaranteed";
        return (
          <div key={i} className="rounded-lg border border-border/60 p-3 space-y-3 relative bg-muted/10">
            <Button type="button" variant="ghost" size="icon" className="absolute top-1.5 right-1.5 h-7 w-7 text-destructive"
              onClick={() => onChange(rows.filter((_, x) => x !== i))}><Trash2 className="w-4 h-4" /></Button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Deal ID <span className="text-destructive">*</span></Label>
                <Input placeholder="DEAL-CTV-IN-001" value={dl.dealId} onChange={(e) => set(i, { dealId: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input placeholder="optional" value={dl.name || ""} onChange={(e) => set(i, { name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={dl.type || "private_auction"}
                  onValueChange={(v) => set(i, { type: v as DealTerm["type"], auctionType: v === "private_auction" ? 2 : 3 })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DEAL_TYPES.map((t) => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {isFixed ? (
                <div className="space-y-1.5">
                  <Label className="text-xs">Fixed CPM</Label>
                  <Input type="number" min={0} step="0.01" value={dl.fixedCpm ?? ""} placeholder="8.00"
                    onChange={(e) => set(i, { fixedCpm: e.target.value === "" ? null : Number(e.target.value) })} />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs">Floor CPM</Label>
                  <Input type="number" min={0} step="0.01" value={dl.floorCpm ?? ""} placeholder="2.50"
                    onChange={(e) => set(i, { floorCpm: e.target.value === "" ? null : Number(e.target.value) })} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Auction type (at)</Label>
                <Select value={String(dl.auctionType ?? 2)} onValueChange={(v) => set(i, { auctionType: Number(v) as DealTerm["auctionType"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AUCTION_TYPES.map((t) => <SelectItem key={t.v} value={String(t.v)}>{t.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Seats (wseat, comma-separated)</Label>
                <Input placeholder="seat-1, seat-2" value={csv(dl.wseat)} onChange={(e) => set(i, { wseat: fromCsv(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Margin % override</Label>
                <Input type="number" min={0} max={100} value={dl.marginPctOverride ?? ""} placeholder="partner default"
                  onChange={(e) => set(i, { marginPctOverride: e.target.value === "" ? null : Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Start date</Label>
                <Input type="date" value={dl.startDate ? String(dl.startDate).slice(0, 10) : ""}
                  onChange={(e) => set(i, { startDate: e.target.value || null })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End date</Label>
                <Input type="date" value={dl.endDate ? String(dl.endDate).slice(0, 10) : ""}
                  onChange={(e) => set(i, { endDate: e.target.value || null })} />
              </div>
              {dl.type === "programmatic_guaranteed" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Volume goal (impressions)</Label>
                  <Input type="number" min={0} value={dl.volumeGoal ?? ""} placeholder="1000000"
                    onChange={(e) => set(i, { volumeGoal: e.target.value === "" ? null : Number(e.target.value) })} />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <Button type="button" variant="outline" className="gap-1.5" onClick={() => onChange([...rows, emptyDealTerm()])}>
        <Plus className="w-4 h-4" /> Add PMP deal
      </Button>
    </div>
  );
};

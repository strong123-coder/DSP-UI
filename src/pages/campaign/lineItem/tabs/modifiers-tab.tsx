import React from "react";
import { Link } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { ExternalLink, Gauge, Plus, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import SelectComponent from "@/components/inputComponents/select-component";
import { useBidModifier, useBidModifierOptions, useModifierFields } from "@/query/useBidModifier";
import { useDeliveryModifier, useDeliveryModifierOptions } from "@/query/useDeliveryModifier";
import { multiplierText, shareText, termText } from "@/utils/bidModifier";
import type { DeliveryModifier } from "@/services/deliveryModifier";
import type { BidModifier, ModifierField } from "@/services/bidModifier";
import type { LineItemFormValues } from "@/utils/schemas/lineItem";

// Pick the advertiser's reusable bid and delivery modifiers and see what they do.
const ModifiersTab: React.FC<{ advertiserId: string; currency: string }> = ({ advertiserId, currency }) => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const selected = watch("bidModifierId");
  const { data: optResp, isLoading } = useBidModifierOptions(advertiserId);
  const options: Array<{ id: string; value: string; terms: number }> = optResp?.data ?? [];
  const { data: modResp } = useBidModifier(selected || null);
  const mod: BidModifier | undefined = modResp?.data?.data;
  const { data: fieldResp } = useModifierFields();
  const fields: ModifierField[] = fieldResp?.data ?? [];

  const delivery = watch("deliveryModifierId");
  const { data: dOptResp, isLoading: dLoading } = useDeliveryModifierOptions(advertiserId);
  const dOptions: Array<{ id: string; value: string; terms: number }> = dOptResp?.data ?? [];
  const { data: dResp } = useDeliveryModifier(delivery || null);
  const dmod: DeliveryModifier | undefined = dResp?.data?.data;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" /> Bid modifier
            </CardTitle>
            <CardDescription>
              Raise, lower or skip the bid for specific requests ("+20% on these apps", "don't bid at night"). The first term
              that matches applies; then the bid is kept within the modifier's min and max, and this line item's max CPM.
            </CardDescription>
          </div>
          <Link to={`/bid-modifier/new?advertiserId=${advertiserId}`} target="_blank"
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0">
            <Plus className="w-3 h-3" /> New modifier
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="bidModifierId">Modifier</Label>
            <SelectComponent id="bidModifierId" value={selected || "__none__"}
              placeholder={isLoading ? "Loading…" : "None"}
              data={[{ name: "None — bid the same everywhere", value: "__none__" }, ...options.map((o) => ({
                name: `${o.value} (${o.terms} term${o.terms === 1 ? "" : "s"})`,
                value: String(o.id),
              }))]}
              onValueChange={(v) => setValue("bidModifierId", v === "__none__" ? "" : v, { shouldDirty: true })} />
            {!isLoading && options.length === 0 && (
              <p className="text-[11px] text-muted-foreground">This advertiser has no bid modifiers yet.</p>
            )}
          </div>

          {selected && mod && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/40 text-sm">
                <span className="font-medium">{mod.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {mod.minBid ? `Min ${mod.minBid} ${currency}` : "No min"} · {mod.maxBid ? `Max ${mod.maxBid} ${currency}` : "No max"}
                  <Link to={`/bid-modifier/edit/${selected}`} target="_blank"
                    className="ml-3 text-primary hover:underline inline-flex items-center gap-1">
                    Edit <ExternalLink className="w-3 h-3" />
                  </Link>
                </span>
              </div>
              {mod.terms.length === 0 ? (
                <p className="px-4 py-3 text-xs text-muted-foreground">No terms: only the min / max bid applies.</p>
              ) : (
                <ol className="divide-y divide-border">
                  {mod.terms.map((t, i) => (
                    <li key={i} className="grid grid-cols-[28px_minmax(0,1fr)_auto] gap-3 px-4 py-2.5 text-sm items-start">
                      <span className="text-xs text-muted-foreground tabular-nums pt-0.5">{i + 1}</span>
                      <span className="min-w-0 break-words">If {termText(t, fields)}</span>
                      <span className={`text-xs font-medium tabular-nums whitespace-nowrap ${t.multiplier === 0 ? "text-destructive" : t.multiplier > 1 ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                        {multiplierText(t.multiplier)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" /> Delivery modifier
            </CardTitle>
            <CardDescription>
              Bid on only part of some traffic ("30% of requests from these apps", "half as often on weekends") without
              changing the price. The first term that matches applies; other requests are always bid on.
            </CardDescription>
          </div>
          <Link to={`/delivery-modifier/new?advertiserId=${advertiserId}`} target="_blank"
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0">
            <Plus className="w-3 h-3" /> New modifier
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="deliveryModifierId">Modifier</Label>
            <SelectComponent id="deliveryModifierId" value={delivery || "__none__"}
              placeholder={dLoading ? "Loading…" : "None"}
              data={[{ name: "None — bid on every eligible request", value: "__none__" }, ...dOptions.map((o) => ({
                name: `${o.value} (${o.terms} term${o.terms === 1 ? "" : "s"})`,
                value: String(o.id),
              }))]}
              onValueChange={(v) => setValue("deliveryModifierId", v === "__none__" ? "" : v, { shouldDirty: true })} />
            {!dLoading && dOptions.length === 0 && (
              <p className="text-[11px] text-muted-foreground">This advertiser has no delivery modifiers yet.</p>
            )}
          </div>

          {delivery && dmod && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/40 text-sm">
                <span className="font-medium">{dmod.name}</span>
                <Link to={`/delivery-modifier/edit/${delivery}`} target="_blank"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                  Edit <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              {dmod.terms.length === 0 ? (
                <p className="px-4 py-3 text-xs text-muted-foreground">No terms: bids on every eligible request.</p>
              ) : (
                <ol className="divide-y divide-border">
                  {dmod.terms.map((t, i) => (
                    <li key={i} className="grid grid-cols-[28px_minmax(0,1fr)_auto] gap-3 px-4 py-2.5 text-sm items-start">
                      <span className="text-xs text-muted-foreground tabular-nums pt-0.5">{i + 1}</span>
                      <span className="min-w-0 break-words">If {termText(t, fields)}</span>
                      <span className={`text-xs font-medium tabular-nums whitespace-nowrap ${t.share === 0 ? "text-destructive" : ""}`}>
                        {shareText(t.share)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModifiersTab;

import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Gauge, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import DeletePopupModal from "@/components/popupModals/delete-popup-modal";
import SelectComponent from "@/components/inputComponents/select-component";
import { useDeleteDeliveryModifier, useDeliveryModifiers } from "@/query/useDeliveryModifier";
import { useAdvertiserOptions } from "@/query/useAdvertiser";
import type { DeliveryModifier } from "@/services/deliveryModifier";

const DeliveryModifierList: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const advertiserId = params.get("advertiserId") || "";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [toDelete, setToDelete] = useState<DeliveryModifier | null>(null);
  const { data: advResp } = useAdvertiserOptions();
  const advertisers: Array<{ id: string; value: string }> = advResp?.data ?? [];

  const { data, isLoading } = useDeliveryModifiers({ page, limit, advertiserId: advertiserId || undefined });
  const rows: DeliveryModifier[] = data?.data?.data ?? [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const deleteMut = useDeleteDeliveryModifier();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Gauge className="w-5 h-5 text-primary" /> Delivery modifiers</h1>
          <p className="text-sm text-muted-foreground">
            Reusable rules for how often a line item bids on matching requests, picked on a line item's Modifiers tab.
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => navigate(`/delivery-modifier/new${advertiserId ? `?advertiserId=${advertiserId}` : ""}`)}>
          <Plus className="w-4 h-4" /> New delivery modifier
        </Button>
      </div>

      <div className="max-w-xs">
        <SelectComponent id="dm-advertiser" search value={advertiserId || "__all__"}
          data={[{ name: "All advertisers", value: "__all__" }, ...advertisers.map((a) => ({ name: a.value, value: String(a.id) }))]}
          onValueChange={(v) => {
            setPage(1);
            setParams(v === "__all__" ? {} : { advertiserId: v });
          }} />
      </div>

      {isLoading && rows.length === 0 ? (
        <LoadingFallback />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-5">Name</TableHead>
                  <TableHead>Advertiser</TableHead>
                  <TableHead className="text-right">Terms</TableHead>
                  <TableHead className="text-right">Used by</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No delivery modifiers yet. Create one, then pick it on a line item's Modifiers tab.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((m) => (
                    <TableRow key={m._id} className="cursor-pointer hover:bg-muted/20" onClick={() => navigate(`/delivery-modifier/edit/${m._id}`)}>
                      <TableCell className="pl-5 font-medium">{m.name}</TableCell>
                      <TableCell className="text-sm">{m.advertiserName || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{m.terms.length}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {m.lineItems ? `${m.lineItems} line item${m.lineItems > 1 ? "s" : ""}` : <span className="text-muted-foreground">Unused</span>}
                      </TableCell>
                      <TableCell className="text-right pr-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${m.name}`}
                          onClick={() => navigate(`/delivery-modifier/edit/${m._id}`)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Delete ${m.name}`}
                          onClick={() => setToDelete(m)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {rows.length > 0 && (
        <ThreeButtonPagination page={page} setPage={setPage} totalPages={totalPages} limit={limit} setLimit={setLimit} />
      )}

      <DeletePopupModal
        isOpen={!!toDelete}
        title={<strong>Delete delivery modifier</strong>}
        description={<span>Delete <strong>{toDelete?.name}</strong>? Only possible once no line item uses it.</span>}
        cancelButtonAction={() => setToDelete(null)}
        deleteButtonAction={() => {
          if (toDelete?._id) deleteMut.mutate(toDelete._id, { onSettled: () => setToDelete(null) });
        }}
        isDeleting={deleteMut.isPending}
      />
    </div>
  );
};

export default DeliveryModifierList;

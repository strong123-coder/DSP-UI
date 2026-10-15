import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bookmark, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import DeletePopupModal from "@/components/popupModals/delete-popup-modal";
import { useDeletePreset, usePresets, useUpdatePreset } from "@/query/usePreset";
import type { Preset, PresetKind } from "@/services/preset";

const KINDS: Array<{ id: PresetKind | ""; label: string }> = [
  { id: "", label: "All" },
  { id: "campaign", label: "Campaign" },
  { id: "lineItem", label: "Line item" },
  { id: "targeting", label: "Targeting" },
];
const KIND_LABEL: Record<PresetKind, string> = { campaign: "Campaign", lineItem: "Line item", targeting: "Targeting" };
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—");

const PresetList: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const kind = (params.get("kind") || "") as PresetKind | "";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [toDelete, setToDelete] = useState<Preset | null>(null);
  const [renaming, setRenaming] = useState<Preset | null>(null);
  const [newName, setNewName] = useState("");

  const { data, isLoading } = usePresets({ page, limit, kind: kind || undefined });
  const rows: Preset[] = data?.data?.data ?? [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const deleteMut = useDeletePreset();
  const updateMut = useUpdatePreset();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><Bookmark className="w-5 h-5 text-primary" /> Presets</h1>
        <p className="text-sm text-muted-foreground">
          Saved settings that prefill new campaigns and line items. Save them from the campaign or line item form, and set
          an advertiser's defaults on the advertiser.
        </p>
      </div>

      <div className="flex gap-1 flex-wrap" role="tablist" aria-label="Preset kind">
        {KINDS.map((k) => (
          <button key={k.id || "all"} type="button" role="tab" aria-selected={kind === k.id}
            onClick={() => {
              setPage(1);
              setParams(k.id ? { kind: k.id } : {});
            }}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
              kind === k.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
            }`}>
            {k.label}
          </button>
        ))}
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
                  <TableHead>Kind</TableHead>
                  <TableHead>Usable by</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No presets yet. Use "Presets › Save as…" on a line item, or "Save these settings as a preset" on a campaign.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="pl-5 font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">{KIND_LABEL[p.kind]}</TableCell>
                      <TableCell className="text-sm">{p.advertiserId ? p.advertiserName || "One advertiser" : "Every advertiser"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(p.updatedAt)}</TableCell>
                      <TableCell className="text-right pr-5 whitespace-nowrap">
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Rename ${p.name}`}
                          onClick={() => {
                            setRenaming(p);
                            setNewName(p.name);
                          }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Delete ${p.name}`}
                          onClick={() => setToDelete(p)}>
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

      <Dialog open={!!renaming} onOpenChange={(o) => !o && setRenaming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="preset-rename">Name</Label>
            <Input id="preset-rename" value={newName} maxLength={120} onChange={(e) => setNewName(e.target.value)} autoFocus />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRenaming(null)}>Cancel</Button>
            <Button type="button" disabled={!newName.trim() || updateMut.isPending}
              onClick={() => renaming?._id && updateMut.mutate({ id: renaming._id, payload: { name: newName.trim() } }, { onSuccess: () => setRenaming(null) })}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeletePopupModal
        isOpen={!!toDelete}
        title={<strong>Delete preset</strong>}
        description={<span>Delete <strong>{toDelete?.name}</strong>? Campaigns and line items made from it keep their settings.</span>}
        cancelButtonAction={() => setToDelete(null)}
        deleteButtonAction={() => {
          if (toDelete?._id) deleteMut.mutate(toDelete._id, { onSettled: () => setToDelete(null) });
        }}
        isDeleting={deleteMut.isPending}
      />
    </div>
  );
};

export default PresetList;

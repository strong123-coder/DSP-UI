import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ListFilter, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import DeletePopupModal from "@/components/popupModals/delete-popup-modal";
import { useDeleteTargetingList, useTargetingLists } from "@/query/useTargetingList";
import type { TargetingList, TargetingListKind } from "@/services/targetingList";
import { VisibilityTag } from "@/components/library/visibility-field";
import { useScope } from "@/query/useScope";

export const LIST_KINDS: Array<{ id: TargetingListKind; label: string; desc: string }> = [
  { id: "bundle", label: "Apps & sites", desc: "App bundles and site domains, used in Targeting › App/Site." },
  { id: "zip", label: "ZIP codes", desc: "Postal codes, used in Targeting › Geo." },
  { id: "deal", label: "Deals", desc: "PMP deal IDs, used in Targeting › App/Site › Deals." },
];

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—");

const TargetingListList: React.FC = () => {
  const navigate = useNavigate();
  const scope = useScope();
  const [params, setParams] = useSearchParams();
  const kind = (LIST_KINDS.some((k) => k.id === params.get("kind")) ? params.get("kind") : "bundle") as TargetingListKind;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<TargetingList | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const query = useMemo(() => ({ page, limit, kind, search: search || undefined }), [page, limit, kind, search]);
  const { data, isLoading } = useTargetingLists(query);
  const rows: TargetingList[] = data?.data?.data ?? [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const deleteMut = useDeleteTargetingList();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><ListFilter className="w-5 h-5 text-primary" /> Targeting lists</h1>
          <p className="text-sm text-muted-foreground">{LIST_KINDS.find((k) => k.id === kind)?.desc}</p>
        </div>
        <Button className="gap-1.5" onClick={() => navigate(`/targeting-list/new?kind=${kind}`)}><Plus className="w-4 h-4" /> New list</Button>
      </div>

      <div className="flex gap-1 flex-wrap" role="tablist" aria-label="List kind">
        {LIST_KINDS.map((k) => (
          <button key={k.id} type="button" role="tab" aria-selected={kind === k.id}
            onClick={() => {
              setPage(1);
              setParams({ kind: k.id });
            }}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
              kind === k.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
            }`}>
            {k.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input id="list-search" placeholder="Search by name…" className="pl-9" value={searchText}
          onChange={(e) => setSearchText(e.target.value)} autoComplete="off" />
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
                  <TableHead className="text-right">Entries</TableHead>
                  <TableHead className="text-right">Used by</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      {search ? `No list matches "${search}".` : "No lists of this kind yet. Create one to reuse it across line items."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((l) => (
                    <TableRow key={l._id} className="cursor-pointer hover:bg-muted/20" onClick={() => navigate(`/targeting-list/edit/${l._id}`)}>
                      <TableCell className="pl-5">
                        <div className="font-medium flex items-center gap-2 flex-wrap">
                          {l.name}
                          <VisibilityTag shared={l.shared} networkName={l.networkName} visibility={l.visibility} orgLevel={scope.orgLevel} />
                        </div>
                        {l.notes && <div className="text-xs text-muted-foreground truncate max-w-[360px]">{l.notes}</div>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{(l.count ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {l.lineItems ? `${l.lineItems} line item${l.lineItems > 1 ? "s" : ""}` : <span className="text-muted-foreground">Unused</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(l.updatedAt)}</TableCell>
                      <TableCell className="text-right pr-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {!l.shared && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${l.name}`}
                              onClick={() => navigate(`/targeting-list/edit/${l._id}`)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Delete ${l.name}`}
                              onClick={() => setToDelete(l)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
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
        title={<strong>Delete list</strong>}
        description={
          <span>
            Delete <strong>{toDelete?.name}</strong>? Only possible once no line item uses it.
          </span>
        }
        cancelButtonAction={() => setToDelete(null)}
        deleteButtonAction={() => {
          if (toDelete?._id) deleteMut.mutate(toDelete._id, { onSettled: () => setToDelete(null) });
        }}
        isDeleting={deleteMut.isPending}
      />
    </div>
  );
};

export default TargetingListList;

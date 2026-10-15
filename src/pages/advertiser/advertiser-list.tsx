import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import DeletePopupModal from "@/components/popupModals/delete-popup-modal";
import { useAdvertiserList, useAdvertiserStatus, useDeleteAdvertiser } from "@/query/useAdvertiser";
import type { Advertiser } from "@/services/advertiser";

const AdvertiserList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<Advertiser | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const params = useMemo(() => ({ page, limit, search: search || undefined }), [page, limit, search]);
  const { data, isLoading } = useAdvertiserList(params);
  const rows: Advertiser[] = data?.data?.data ?? [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const statusMut = useAdvertiserStatus();
  const deleteMut = useDeleteAdvertiser();
  // The status the user just picked, shown at once while the change saves;
  // cleared when it's saved (the refreshed list then shows it) or fails.
  const [pending, setPending] = useState<Record<string, "active" | "paused">>({});
  const setStatus = (a: Advertiser, active: boolean) => {
    const id = a._id!;
    setPending((p) => ({ ...p, [id]: active ? "active" : "paused" }));
    statusMut.mutate(
      { id, status: active ? "active" : "paused" },
      {
        onSettled: () =>
          setPending((p) => {
            const { [id]: _done, ...rest } = p;
            return rest;
          }),
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Advertisers</h1>
          <p className="text-sm text-muted-foreground">The brands you run campaigns for. Each advertiser owns its campaigns and creatives.</p>
        </div>
        <Button className="gap-1.5" onClick={() => navigate("/advertiser/new")}><Plus className="w-4 h-4" /> New advertiser</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input id="advertiser-search" placeholder="Search by name, bundle or domain…" className="pl-9" value={searchText}
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
                  <TableHead className="pl-5">Advertiser</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead className="text-right">Campaigns</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      {search ? `No advertiser matches "${search}".` : "No advertisers yet. Create one, then add its campaigns."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((a) => (
                    <TableRow key={a._id} className="cursor-pointer hover:bg-muted/20"
                      onClick={() => navigate(`/campaign/list?advertiserId=${a._id}`)}>
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3 min-w-0">
                          {a.appIconLink ? (
                            <img src={a.appIconLink} alt="" className="w-8 h-8 rounded-md object-cover border border-border" />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border border-border text-xs font-semibold text-muted-foreground">
                              {a.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium truncate">{a.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{a.domain || "No domain set"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{a.categoryName || <span className="text-muted-foreground">Not set</span>}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {a.appBundle ? `${a.appBundle}${a.appOs ? ` · ${a.appOs}` : ""}` : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {a.campaigns?.active ?? 0} <span className="text-muted-foreground">/ {a.campaigns?.total ?? 0}</span>
                        {(pending[a._id!] ?? a.status) === "paused" && (a.campaigns?.active ?? 0) > 0 && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400">not bidding: advertiser paused</div>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Switch checked={(pending[a._id!] ?? a.status) === "active"} disabled={!!pending[a._id!]}
                          aria-label={`${a.status === "active" ? "Pause" : "Activate"} ${a.name}`}
                          onCheckedChange={(v) => setStatus(a, v)} />
                      </TableCell>
                      <TableCell className="text-right pr-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate(`/campaign/add?advertiserId=${a._id}`)}>
                          <Plus className="w-3.5 h-3.5" /> Campaign
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${a.name}`}
                          onClick={() => navigate(`/advertiser/edit/${a._id}`)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Delete ${a.name}`}
                          onClick={() => setToDelete(a)}>
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
        title={<strong>Delete advertiser</strong>}
        description={
          <span>
            Delete <strong>{toDelete?.name}</strong>? Only possible once it has no campaigns.
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

export default AdvertiserList;

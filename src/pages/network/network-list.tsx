import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LogIn, Network as NetworkIcon, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import DeletePopupModal from "@/components/popupModals/delete-popup-modal";
import { useDeleteNetwork, useNetworks, useNetworkStatus } from "@/query/useNetwork";
import { useScope } from "@/query/useScope";
import type { Network } from "@/services/network";
import { useEnterNetwork } from "./use-enter-network";

const NetworkList: React.FC = () => {
  const navigate = useNavigate();
  const scope = useScope();
  const enter = useEnterNetwork();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<Network | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const params = useMemo(() => ({ page, limit, search: search || undefined }), [page, limit, search]);
  const { data, isLoading } = useNetworks(params, scope.canManageNetworks);
  const rows: Network[] = data?.data?.data ?? [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const statusMut = useNetworkStatus();
  const deleteMut = useDeleteNetwork();
  const [pending, setPending] = useState<Record<string, "active" | "inactive">>({});
  const setStatus = (n: Network, on: boolean) => {
    const id = n._id;
    setPending((p) => ({ ...p, [id]: on ? "active" : "inactive" }));
    statusMut.mutate(
      { id, status: on ? "active" : "inactive" },
      {
        onSettled: () =>
          setPending((p) => {
            const { [id]: _done, ...rest } = p;
            return rest;
          }),
      },
    );
  };

  if (!scope.canManageNetworks) return <Navigate to="/dashboard" replace />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><NetworkIcon className="w-5 h-5 text-primary" /> Networks</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Each network gets its own logins and sees only its own advertisers and campaigns. Enter a network to work
            exactly as its users do.
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => navigate("/network/new")}><Plus className="w-4 h-4" /> New network</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input id="network-search" placeholder="Search networks…" className="pl-9" value={searchText}
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
                  <TableHead className="pl-5">Network</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead className="text-right">Publisher cut</TableHead>
                  <TableHead className="text-right">Advertisers</TableHead>
                  <TableHead className="text-right">Live campaigns</TableHead>
                  <TableHead className="text-right">Logins</TableHead>
                  <TableHead>On</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      {search ? `No network matches "${search}".` : "No networks yet. Create one, then give it a login."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((n) => {
                    const on = (pending[n._id] ?? n.status) === "active";
                    return (
                      <TableRow key={n._id} className="cursor-pointer hover:bg-muted/20" onClick={() => navigate(`/network/edit/${n._id}`)}>
                        <TableCell className="pl-5">
                          <div className="font-medium">{n.name}</div>
                          <div className="text-xs text-muted-foreground">{n.contactEmail || n.contactName || "No contact set"}</div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {n.requireApproval ? (
                            <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Required</span>
                          ) : (
                            <span className="text-muted-foreground">Not required</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {n.publisherCut ? `${n.publisherCut}%` : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{n.advertisers ?? 0}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {n.activeCampaigns ?? 0}
                          {!on && (n.activeCampaigns ?? 0) > 0 && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400">not bidding: network off</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{n.users ?? 0}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Switch checked={on} disabled={!!pending[n._id]}
                            aria-label={`${on ? "Turn off" : "Turn on"} ${n.name}`}
                            onCheckedChange={(v) => setStatus(n, v)} />
                        </TableCell>
                        <TableCell className="text-right pr-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="gap-1" onClick={() => enter({ id: n._id, name: n.name })}>
                            <LogIn className="w-3.5 h-3.5" /> Enter
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${n.name}`}
                            onClick={() => navigate(`/network/edit/${n._id}`)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label={`Delete ${n.name}`}
                            onClick={() => setToDelete(n)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
        title={<strong>Delete network</strong>}
        description={
          <span>
            Delete <strong>{toDelete?.name}</strong>? Only possible once it has no advertisers. Its logins stop working.
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

export default NetworkList;

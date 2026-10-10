import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Server, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ThreeButtonPagination from "@/components/pagination/three-button-pagination";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useMcpCategories, useMcpServers } from "@/query/useMcpPublisher";
import type { McpCategory, McpServer } from "@/services/mcpPublisher";
import { StatusBadge, STATUS_META, categoryLabel } from "../_shared";

const McpServers: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const params = useMemo(() => ({ page, limit, search: search || undefined }), [page, limit, search]);
  const { data: resp, isLoading } = useMcpServers(params);
  const { data: catResp } = useMcpCategories();
  const categories: McpCategory[] = catResp?.data?.data?.categories ?? [];
  const rows: McpServer[] = resp?.data?.data ?? [];
  const totalPages = resp?.data?.pagination?.totalPages || 1;

  if (isLoading && rows.length === 0) return <LoadingFallback />;

  if (!search && rows.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto mt-10">
        <CardContent className="py-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Monetize your first MCP server</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Register your server, grab a test key, add one line to your Go MCP server and you'll see a
              test sponsored line under your tool results in minutes.
            </p>
          </div>
          <Button onClick={() => navigate("/supply/servers/new")} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add MCP server
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" /> My MCP Servers
          </h1>
          <p className="text-sm text-muted-foreground">Servers you monetize, their review status and placements.</p>
        </div>
        <Button onClick={() => navigate("/supply/servers/new")} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add MCP server
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search servers…"
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-5">Server</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Placements</TableHead>
                <TableHead className="text-right pr-5">Your share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No servers match “{search}”.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((s) => (
                  <TableRow
                    key={s._id}
                    className="cursor-pointer hover:bg-muted/20"
                    onClick={() => navigate(`/supply/servers/${s._id}`)}
                  >
                    <TableCell className="pl-5">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                        {STATUS_META[s.status ?? "draft"]?.hint}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">
                      {s.categories.map((c) => categoryLabel(categories, c)).join(", ")}
                    </TableCell>
                    <TableCell className="text-xs">{s.placements.map((p) => p.key).join(", ")}</TableCell>
                    <TableCell className="text-right pr-5 font-semibold">
                      {Math.round((s.revShare ?? 0.7) * 100)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {rows.length > 0 && (
        <ThreeButtonPagination page={page} setPage={setPage} totalPages={totalPages} limit={limit} setLimit={setLimit} />
      )}
    </div>
  );
};

export default McpServers;

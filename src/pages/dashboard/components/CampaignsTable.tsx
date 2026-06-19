import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetricValue } from "@/components/ui/metric-value";



interface CampaignsTableProps {
  enrichedCampaigns: Array<{
    _id: string;
    title: string;
    status: string;
    clicks: number;
    installs: number;
    events: number;
    spent: number;
    cpi: number | null;
    cpc: number | null;
  }>;
  sortBy: string;
  onSortByChange: (val: string) => void;
  limit: number;
  onLimitChange: (val: number) => void;
}

export const CampaignsTable: React.FC<CampaignsTableProps> = ({
  enrichedCampaigns,
  sortBy,
  onSortByChange,
  limit,
  onLimitChange,
}) => {
  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border/40 gap-4">
        <div>
          <CardTitle className="text-base font-bold">Top Campaigns</CardTitle>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Limit</span>
            <Select value={String(limit)} onValueChange={(val) => onLimitChange(Number(val))}>
              <SelectTrigger className="w-[70px] h-8 bg-card border-border/60">
                <SelectValue placeholder={String(limit)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Sort by</span>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-[100px] h-8 bg-card border-border/60">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spent">Spent</SelectItem>
                <SelectItem value="click">Click</SelectItem>
                <SelectItem value="install">Install</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="cpi">CPI</SelectItem>
                <SelectItem value="cpc">CPC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-xs font-bold uppercase tracking-wider pl-6 py-4">
                  Campaign
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4">
                  Status
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-right">
                  Click
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-right">
                  Install
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-right">
                  Events
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-right">
                  Spent
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider py-4 text-right">
                  CPI
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider pr-6 py-4 text-right">
                  CPC
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm font-medium">
                    No campaigns data available
                  </TableCell>
                </TableRow>
              ) : (
                enrichedCampaigns.map((camp) => (
                  <TableRow
                    key={camp._id}
                    className="hover:bg-muted/10 transition-colors duration-250"
                  >
                    <TableCell className="pl-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-bold text-sm uppercase">
                        {camp.title?.trim()?.charAt(0) || "C"}
                      </div>
                      <span className="font-semibold text-sm truncate max-w-[320px] sm:max-w-[450px]">
                        {camp.title}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${camp.status === "Active"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                            }`}
                        />
                        <span className="text-xs font-semibold">{camp.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right font-medium">
                      <MetricValue value={camp.clicks} />
                    </TableCell>
                    <TableCell className="py-4 text-right font-medium">
                      <MetricValue value={camp.installs} />
                    </TableCell>
                    <TableCell className="py-4 text-right font-medium">
                      <MetricValue value={camp.events} />
                    </TableCell>
                    <TableCell className="py-4 text-right font-bold text-foreground">
                      <MetricValue value={camp.spent} currency decimals={2} />
                    </TableCell>
                    <TableCell className="py-4 text-right font-medium">
                      <MetricValue value={camp.cpi} currency decimals={2} />
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right font-medium">
                      <MetricValue value={camp.cpc} currency decimals={2} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

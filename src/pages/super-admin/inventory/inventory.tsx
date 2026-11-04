import React, { useRef, useState } from "react";
import { FileUp, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventoryUploads, useUploadInventory } from "@/query/useInventory";
import type { InventoryUpload } from "@/services/inventory";

const MAX_BYTES = 5 * 1024 * 1024;

// Super admin › Inventory: load the exchange inventory report that feeds the
// line item's Inventory list. A file with an "App/Site Bundle" column replaces
// the country's bundle list; one with "App/Site Name", its name list.
const InventoryUploads: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [country, setCountry] = useState("IN");
  const [file, setFile] = useState<File | null>(null);
  const { data } = useInventoryUploads();
  const uploads: InventoryUpload[] = data?.data?.data ?? [];
  const uploadMut = useUploadInventory();

  const submit = async () => {
    if (!/^[A-Za-z]{2}$/.test(country.trim())) return toast.error("Enter the country as a 2-letter code, e.g. IN");
    if (!file) return toast.error("Choose the report CSV first");
    if (file.size > MAX_BYTES) return toast.error(`${file.name} is larger than 5 MB. Split it by exchange or device type.`);
    const csv = await file.text();
    uploadMut.mutate(
      { country: country.trim().toUpperCase(), fileName: file.name, csv },
      {
        onSuccess: () => {
          setFile(null);
          if (fileRef.current) fileRef.current.value = "";
        },
      },
    );
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2"><ListChecks className="w-5 h-5 text-primary" /> Inventory</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          The exchange inventory every line item can browse under Targeting › Inventory list. Upload the latest report
          to replace a country's list.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload a report</CardTitle>
          <CardDescription>
            A CSV with Inventory Source, Device Type, App/Site Bundle (or App/Site Name) and Requests columns. A bundle
            file replaces the country's bundle list; a name file replaces its name list. Rows without an app are skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="inv-country">Country</Label>
            <Input id="inv-country" value={country} maxLength={2} placeholder="IN" onChange={(e) => setCountry(e.target.value.toUpperCase())} />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="inv-file">Report CSV</Label>
            <input ref={fileRef} id="inv-file" type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <div className="flex items-center gap-2 min-w-0">
              <Button type="button" variant="outline" className="gap-1.5 shrink-0" onClick={() => fileRef.current?.click()}>
                <FileUp className="w-4 h-4" /> Choose file
              </Button>
              <span className="text-sm text-muted-foreground truncate">
                {file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : "No file chosen"}
              </span>
            </div>
          </div>
          <Button type="button" onClick={submit} disabled={uploadMut.isPending || !file}>
            {uploadMut.isPending ? "Loading…" : "Upload and replace"}
          </Button>
        </CardContent>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-5">Uploaded</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>List</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right">Apps</TableHead>
                <TableHead className="text-right pr-5">Requests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nothing uploaded yet.</TableCell>
                </TableRow>
              ) : (
                uploads.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="pl-5 text-sm whitespace-nowrap">{new Date(u.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{u.country}</TableCell>
                    <TableCell className="text-sm">{u.kind === "bundle" ? "Bundles" : "App names"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[260px] truncate" title={u.fileName || ""}>{u.fileName || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{u.apps.toLocaleString()}</TableCell>
                    <TableCell className="text-right pr-5 tabular-nums">{u.requests.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default InventoryUploads;

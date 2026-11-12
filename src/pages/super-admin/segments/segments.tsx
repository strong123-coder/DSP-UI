import React, { useRef, useState } from "react";
import { FileUp, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSegmentUploads, useUploadSegments } from "@/query/useSegment";
import type { SegmentUpload } from "@/services/segment";

// The backend takes JSON bodies up to 5 MB, and base64 grows a file by a third.
const MAX_BYTES = 3.5 * 1024 * 1024;

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ""));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

// Super admin › Segments: load the audience segment workbook that every line
// item's Targeting › Segments picks from.
const SegmentUploads: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [country, setCountry] = useState("IN");
  const [file, setFile] = useState<File | null>(null);
  const { data } = useSegmentUploads();
  const uploads: SegmentUpload[] = data?.data?.data ?? [];
  const uploadMut = useUploadSegments();

  const submit = async () => {
    if (!/^[A-Za-z]{2}$/.test(country.trim())) return toast.error("Enter the country as a 2-letter code, e.g. IN");
    if (!file) return toast.error("Choose the segment workbook first");
    if (file.size > MAX_BYTES) return toast.error(`${file.name} is larger than 3.5 MB.`);
    const encoded = await toBase64(file);
    uploadMut.mutate(
      { country: country.trim().toUpperCase(), fileName: file.name, file: encoded },
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
        <h1 className="text-xl font-bold flex items-center gap-2"><UsersRound className="w-5 h-5 text-primary" /> Segments</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          The audience segment catalog line items pick from under Targeting › Segments. Uploading replaces a country's
          catalog and refreshes the IAB list exchanges send.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload the segment workbook</CardTitle>
          <CardDescription>
            An .xlsx (or .csv) with Category, Sub-Category, Segment Name, Definition and % of Reachable Base columns. Reach
            is the % times the base in the Assumptions sheet (500 Mn devices if it has none). Segments whose rules we know
            go live; the rest are listed as needing data. Segments the new file drops stay, marked not offered.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="seg-country">Country</Label>
            <Input id="seg-country" value={country} maxLength={2} placeholder="IN" onChange={(e) => setCountry(e.target.value.toUpperCase())} />
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="seg-file">Workbook</Label>
            <input ref={fileRef} id="seg-file" type="file" className="hidden"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
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
                <TableHead>File</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">Segments</TableHead>
                <TableHead className="text-right pr-5">Live</TableHead>
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
                    <TableCell className="text-sm text-muted-foreground max-w-[260px] truncate" title={u.fileName || ""}>{u.fileName || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{u.baseMn ? `${u.baseMn} Mn` : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{u.segments.toLocaleString()}</TableCell>
                    <TableCell className="text-right pr-5 tabular-nums">{u.live.toLocaleString()}</TableCell>
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

export default SegmentUploads;

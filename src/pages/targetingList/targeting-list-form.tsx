import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ChevronRight, Download, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import LoadingFallback from "@/components/ui/loading-fallback";
import { splitValues } from "@/components/targeting/values-input";
import { useCreateTargetingList, useTargetingList, useUpdateTargetingList } from "@/query/useTargetingList";
import SelectComponent from "@/components/inputComponents/select-component";
import type { TargetingListKind } from "@/services/targetingList";

const MAX_VALUES = 50000;

// Entries as the engine compares them: trimmed, lower-cased, unique. Bundles
// and deals split on spaces too; postal codes may contain spaces ("SW1A 1AA"),
// so ZIP lists split on lines and commas only and then drop the spaces.
const normalise = (text: string, kind: TargetingListKind = "bundle") =>
  kind === "zip"
    ? [...new Set(text.split(/[,;\n]+/).map((v) => v.toLowerCase().replace(/\s+/g, "")).filter(Boolean))]
    : [...new Set(splitValues(text).map((v) => v.toLowerCase()))];

const KIND_TEXT: Record<TargetingListKind, { title: string; desc: string; placeholder: string }> = {
  bundle: {
    title: "App bundles & domains",
    desc: "One per line, or separated by commas.",
    placeholder: "com.example.app\nid1234567890\nnews.example.com",
  },
  zip: { title: "ZIP / postal codes", desc: "One per line, or separated by commas. Spaces are ignored.", placeholder: "10001\n94105\nSW1A 1AA" },
  deal: { title: "Deal IDs", desc: "PMP deal IDs, one per line or separated by commas.", placeholder: "pmp-sports-2026\npg-ctv-q4" },
};

const TargetingListForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [search] = useSearchParams();
  const [kind, setKind] = useState<TargetingListKind>(
    (["bundle", "zip", "deal"].includes(search.get("kind") || "") ? search.get("kind") : "bundle") as TargetingListKind,
  );
  const navigate = useNavigate();
  const { data: resp, isLoading } = useTargetingList(id);
  const createMut = useCreateTargetingList();
  const updateMut = useUpdateTargetingList();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [text, setText] = useState("");
  const [nameError, setNameError] = useState("");

  const list = resp?.data?.data;
  useEffect(() => {
    if (list) {
      setName(list.name || "");
      setNotes(list.notes || "");
      setText((list.values || []).join("\n"));
      setKind(list.kind || "bundle");
    }
  }, [list]);

  const values = useMemo(() => normalise(text, kind), [text, kind]);
  const tooMany = values.length > MAX_VALUES;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      toast.error(`${f.name} is larger than 4 MB.`);
      return;
    }
    const added = normalise(await f.text(), kind);
    setText((t) => [...new Set([...normalise(t, kind), ...added])].join("\n"));
    toast.success(`Added ${added.length.toLocaleString()} entries from ${f.name}`);
  };

  const download = () => {
    const blob = new Blob([values.join("\n") + "\n"], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(name || "list").replace(/[^\w-]+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("List name is required");
      toast.error("List name is required");
      return;
    }
    if (tooMany) {
      toast.error(`A list can hold at most ${MAX_VALUES.toLocaleString()} entries`);
      return;
    }
    const payload = { name: name.trim(), notes: notes.trim() || null, values };
    const done = () => navigate(`/targeting-list/list?kind=${kind}`);
    if (isEdit) updateMut.mutate({ id: id!, payload }, { onSuccess: done });
    else createMut.mutate({ ...payload, kind }, { onSuccess: done });
  };

  if (isEdit && isLoading) return <LoadingFallback />;
  const saving = createMut.isPending || updateMut.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-24 max-w-4xl">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to={`/targeting-list/list?kind=${kind}`} className="hover:text-foreground">Targeting lists</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{isEdit ? list?.name || "Edit list" : "New list"}</span>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">List</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">Name <span className="text-destructive">*</span></Label>
            <Input id="list-name" placeholder="e.g. ST_Vid_iOS" value={name} maxLength={120}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              aria-invalid={!!nameError} errorTooltip={nameError} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="list-kind">Holds</Label>
            <SelectComponent id="list-kind" value={kind} disabled={isEdit}
              data={[
                { name: "App bundles & site domains", value: "bundle" },
                { name: "ZIP / postal codes", value: "zip" },
                { name: "PMP deal IDs", value: "deal" },
              ]}
              onValueChange={(v) => setKind(v as TargetingListKind)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="list-notes">Notes</Label>
            <Input id="list-notes" placeholder="What this list is for" value={notes} maxLength={2000}
              onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base">{KIND_TEXT[kind].title}</CardTitle>
            <CardDescription>
              {KIND_TEXT[kind].desc} Upload a .txt or .csv to add its entries. Duplicates and letter case are ignored.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".txt,.csv,text/plain,text/csv" className="hidden" onChange={onFile} />
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
              <Upload className="w-3.5 h-3.5" /> Upload file
            </Button>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={!values.length} onClick={download}>
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea id="list-values" rows={16} spellCheck={false} className="font-mono text-xs min-h-[280px] max-h-[560px] overflow-y-auto"
            placeholder={KIND_TEXT[kind].placeholder} value={text}
            onChange={(e) => setText(e.target.value)} aria-describedby="list-count" />
          <p id="list-count" className={`text-xs tabular-nums ${tooMany ? "text-destructive" : "text-muted-foreground"}`}>
            {values.length.toLocaleString()} unique {values.length === 1 ? "entry" : "entries"}
            {tooMany ? ` · over the ${MAX_VALUES.toLocaleString()} limit` : ""}
          </p>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-6 py-3 flex items-center gap-3 justify-end z-20">
        <Button type="button" variant="outline" onClick={() => navigate(`/targeting-list/list?kind=${kind}`)} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save list" : "Create list"}</Button>
      </div>
    </form>
  );
};

export default TargetingListForm;

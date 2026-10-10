import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { McpCategory, McpServerStatus } from "@/services/mcpPublisher";

export const STATUS_META: Record<McpServerStatus, { label: string; className: string; hint: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground", hint: "Integrate with a test key, then submit for review." },
  in_review: { label: "In review", className: "bg-amber-100 text-amber-800", hint: "We're reviewing your server. Test keys keep working." },
  live: { label: "Live", className: "bg-emerald-100 text-emerald-800", hint: "Live keys are serving ads." },
  paused: { label: "Paused", className: "bg-slate-200 text-slate-700", hint: "You paused ads. Resume any time." },
  rejected: { label: "Changes needed", className: "bg-red-100 text-red-800", hint: "Fix the notes below and resubmit." },
  suspended: { label: "Suspended", className: "bg-red-100 text-red-800", hint: "Ads were stopped by our team. Contact support." },
};

export const StatusBadge: React.FC<{ status?: McpServerStatus }> = ({ status = "draft" }) => {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return <Badge className={`${meta.className} border-0 font-medium`}>{meta.label}</Badge>;
};

export const Section: React.FC<{
  icon?: React.ReactNode;
  title: string;
  desc?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, title, desc, action, children }) => (
  <Card>
    <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
      <div className="space-y-1.5">
        <CardTitle className="text-base flex items-center gap-2">{icon} {title}</CardTitle>
        {desc && <CardDescription>{desc}</CardDescription>}
      </div>
      {action}
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

// Toggleable category chips. `max` caps the selection.
export const CategoryChips: React.FC<{
  categories: McpCategory[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
  disabledIds?: string[];
}> = ({ categories, value, onChange, max, disabledIds = [] }) => (
  <div className="flex flex-wrap gap-2">
    {categories.map((c) => {
      const on = value.includes(c.id);
      const disabled = disabledIds.includes(c.id) || (!on && !!max && value.length >= max);
      return (
        <button
          key={c.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(on ? value.filter((v) => v !== c.id) : [...value, c.id])}
          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
            on
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background hover:bg-primary/5 border-border text-foreground"
          } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {c.label}
          {c.sensitive && <span className="ml-1 opacity-70">· opt-in</span>}
        </button>
      );
    })}
  </div>
);

export const categoryLabel = (cats: McpCategory[], id: string) => cats.find((c) => c.id === id)?.label ?? id;

export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const CopyButton: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5 h-8"
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }
      }}
    >
      {done ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {label ?? (done ? "Copied" : "Copy")}
    </Button>
  );
};

export const CodeBlock: React.FC<{ code: string; title?: string }> = ({ code, title }) => (
  <div className="rounded-lg border border-border overflow-hidden">
    <div className="flex items-center justify-between bg-muted/40 px-3 py-1.5 border-b border-border">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      <CopyButton text={code} />
    </div>
    <pre className="text-xs p-3 overflow-x-auto bg-muted/10 leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);

// Trimmed, non-empty, de-duplicated (the API rejects duplicates).
export const csvToArr = (s: string) => [...new Set(s.split(",").map((x) => x.trim()).filter(Boolean))];
export const arrToCsv = (a?: string[]) => (a || []).join(", ");

// Comma-separated list input that keeps the raw text while typing.
export const CsvInput: React.FC<{
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  id?: string;
}> = ({ value, onChange, placeholder, id }) => {
  const [text, setText] = useState(arrToCsv(value));
  useEffect(() => {
    if (arrToCsv(csvToArr(text)) !== arrToCsv(value)) setText(arrToCsv(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <Input
      id={id}
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        onChange(csvToArr(e.target.value));
      }}
    />
  );
};

// Number input that keeps the raw text while typing (a controlled
// Number(value) field swallows the "." in "1.5").
export const DecimalInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: string;
  placeholder?: string;
}> = ({ value, onChange, min = 0, step = "0.01", placeholder }) => {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    if (Number(text) !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <Input
      type="text"
      inputMode="decimal"
      value={text}
      min={min}
      step={step}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9.]/g, "");
        if ((raw.match(/\./g) || []).length > 1) return;
        setText(raw);
        const n = Number(raw);
        if (raw !== "" && !Number.isNaN(n)) onChange(n);
      }}
    />
  );
};

import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ChevronRight, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useCreateNetwork, useNetwork, useUpdateNetwork } from "@/query/useNetwork";
import { useScope } from "@/query/useScope";
import NetworkLogins from "./components/network-logins";
import { useEnterNetwork } from "./use-enter-network";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const NetworkForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const scope = useScope();
  const enter = useEnterNetwork();
  const { data: resp, isLoading } = useNetwork(id);
  const createMut = useCreateNetwork();
  const updateMut = useUpdateNetwork();

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [requireApproval, setRequireApproval] = useState(true);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const network = resp?.data?.data;
  useEffect(() => {
    if (!network) return;
    setName(network.name || "");
    setContactName(network.contactName || "");
    setContactEmail(network.contactEmail || "");
    setRequireApproval(network.requireApproval !== false);
    setNotes(network.notes || "");
  }, [network]);

  if (!scope.canManageNetworks) return <Navigate to="/dashboard" replace />;
  if (isEdit && isLoading) return <LoadingFallback />;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Give the network a name";
    if (contactEmail.trim() && !emailOk(contactEmail.trim())) errs.contactEmail = "Enter a valid email address";
    setErrors(errs);
    if (Object.keys(errs).length) return toast.error(Object.values(errs)[0]);
    const payload = {
      name: name.trim(),
      contactName: contactName.trim() || null,
      contactEmail: contactEmail.trim() || null,
      requireApproval,
      notes: notes.trim() || null,
    };
    if (isEdit) updateMut.mutate({ id: id!, payload }, { onSuccess: () => navigate("/network/list") });
    // A new network needs a login next, so stay on it.
    else createMut.mutate(payload, { onSuccess: (r: any) => navigate(`/network/edit/${r?.data?.data?._id}`) });
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-24 max-w-5xl">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/network/list" className="hover:text-foreground">Networks</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{isEdit ? network?.name || "Edit" : "New network"}</span>
      </nav>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Network</CardTitle>
            <CardDescription>Who the network is and how its campaigns are approved.</CardDescription>
          </div>
          {isEdit && network && (
            <Button type="button" variant="outline" size="sm" className="gap-1.5 shrink-0"
              onClick={() => enter({ id: network._id, name: network.name })}>
              <LogIn className="w-4 h-4" /> Enter network
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nw-name">Name <span className="text-destructive">*</span></Label>
            <Input id="nw-name" value={name} maxLength={120} placeholder="e.g. Acme Media" aria-invalid={!!errors.name}
              errorTooltip={errors.name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nw-contact">Contact name</Label>
            <Input id="nw-contact" value={contactName} maxLength={120} placeholder="Who you deal with"
              onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nw-email">Contact email</Label>
            <Input id="nw-email" type="email" value={contactEmail} placeholder="ops@acme.example" aria-invalid={!!errors.contactEmail}
              errorTooltip={errors.contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div className="space-y-1">
              <Label htmlFor="nw-approval" className="text-sm">Require approval</Label>
              <p className="text-xs text-muted-foreground max-w-xl">
                New campaigns, line items and creatives from this network wait for your approval, and so do changes
                to budget, bids, targeting, dates, creatives and links. Turn off only for networks you trust. Bidding
                still needs the super admin to turn it on.
              </p>
            </div>
            <Switch id="nw-approval" checked={requireApproval} onCheckedChange={setRequireApproval} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nw-notes">Notes</Label>
            <Textarea id="nw-notes" value={notes} maxLength={2000} rows={3} placeholder="Commercial terms, contacts, anything your team should know"
              onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isEdit && network && <NetworkLogins networkId={network._id} networkName={network.name} />}

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur px-6 py-3 flex items-center gap-3 justify-end z-20">
        <Button type="button" variant="outline" onClick={() => navigate("/network/list")} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save network" : "Create network"}</Button>
      </div>
    </form>
  );
};

export default NetworkForm;

import React, { useState } from "react";
import { Copy, KeyRound, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddNetworkLogin, useNetworkLogins } from "@/query/useNetwork";
import { useAppStore } from "@/store";
import { roleLabel } from "@/utils/roles";

type Role = "network_admin" | "network_team";

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "network_admin", label: "Network admin", hint: "Everything in the network, and adds its own team" },
  { value: "network_team", label: "Network team", hint: "Only what the network admin allows" },
];

// A password the org can pass on; the network should change it after signing in.
const makePassword = () => {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
};

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  } catch {
    toast.error("Couldn't copy. Select the text and copy it yourself.");
  }
};

// The network's sign-in accounts. The org creates them and shares the
// details; network users sign in on the normal login page with this org.
const NetworkLogins: React.FC<{ networkId: string; networkName: string }> = ({ networkId, networkName }) => {
  const { data, isLoading } = useNetworkLogins(networkId);
  const logins: any[] = data?.data?.data ?? [];
  const orgName: string = useAppStore((s) => s.orgConfig?.name) || "";
  const addMut = useAddNetworkLogin();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", type: (logins.length ? "network_team" : "network_admin") as Role });
  const [shared, setShared] = useState<{ email: string; password: string } | null>(null);

  const start = () => {
    setForm({ name: "", email: "", mobile: "", password: makePassword(), type: logins.some((l) => l.type === "network_admin") ? "network_team" : "network_admin" });
    setShared(null);
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return toast.error("Enter the person's name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return toast.error("Enter a valid email address");
    if (!form.mobile.trim()) return toast.error("Enter a mobile number");
    if (form.password.length < 6) return toast.error("The password needs at least 6 characters");
    addMut.mutate(
      { ...form, name: form.name.trim(), email: form.email.trim().toLowerCase(), mobile: form.mobile.trim(), networkId },
      { onSuccess: () => setShared({ email: form.email.trim().toLowerCase(), password: form.password }) },
    );
  };

  const signInUrl = `${window.location.origin}/login`;
  const shareText = shared
    ? `Sign in to ${networkName}\n${signInUrl}\nOrganization: ${orgName}\nEmail: ${shared.email}\nPassword: ${shared.password}`
    : "";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2"><KeyRound className="w-4 h-4 text-primary" /> Logins</CardTitle>
          <CardDescription>
            People at {networkName} sign in on the normal login page by picking {orgName ? <strong>{orgName}</strong> : "your organization"}.
          </CardDescription>
        </div>
        <Button type="button" size="sm" className="gap-1.5 shrink-0" onClick={start}><Plus className="w-4 h-4" /> Add login</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-5">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : logins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No logins yet. Add the network's admin first; they can add the rest of their team.
                  </TableCell>
                </TableRow>
              ) : (
                logins.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="pl-5 font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell className="text-sm">{roleLabel(u.type)}</TableCell>
                    <TableCell className="pr-5 text-sm capitalize">{u.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {shared ? (
            <>
              <DialogHeader>
                <DialogTitle>Share these sign-in details</DialogTitle>
                <DialogDescription>
                  Send them to the person privately. The password isn't shown again; ask them to change it after signing in.
                </DialogDescription>
              </DialogHeader>
              <pre className="rounded-md border border-border bg-muted/40 p-3 text-sm whitespace-pre-wrap break-all select-all">{shareText}</pre>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Done</Button>
                <Button type="button" className="gap-1.5" onClick={() => copy(shareText)}><Copy className="w-4 h-4" /> Copy details</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Add a login for {networkName}</DialogTitle>
                <DialogDescription>They will see only this network's advertisers, campaigns and reports.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Role</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Role">
                    {ROLES.map((r) => (
                      <label key={r.value} className={`rounded-md border p-3 cursor-pointer text-sm ${form.type === r.value ? "border-primary bg-primary/5" : "border-border"}`}>
                        <input type="radio" name="nl-role" className="sr-only" checked={form.type === r.value}
                          onChange={() => setForm((f) => ({ ...f, type: r.value }))} />
                        <div className="font-medium">{r.label}</div>
                        <div className="text-xs text-muted-foreground">{r.hint}</div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nl-name">Name</Label>
                  <Input id="nl-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nl-mobile">Mobile</Label>
                  <Input id="nl-mobile" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nl-email">Email</Label>
                  <Input id="nl-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nl-password">Password</Label>
                  <div className="flex gap-2">
                    <Input id="nl-password" value={form.password} className="font-mono" autoComplete="new-password"
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                    <Button type="button" variant="outline" size="icon" aria-label="Make a new password"
                      onClick={() => setForm((f) => ({ ...f, password: makePassword() }))}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={addMut.isPending}>Cancel</Button>
                <Button type="button" onClick={save} disabled={addMut.isPending}>{addMut.isPending ? "Creating…" : "Create login"}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NetworkLogins;

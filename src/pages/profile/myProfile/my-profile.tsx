import React, { useState } from "react";
import {
  Mail,
  Phone,
  Shield,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Pencil,
  Loader2,
} from "lucide-react";
import { useGetUserProfile, useUpdateUserProfilePic } from "@/query/useUserManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MyProfile: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useGetUserProfile();
  const [copied, setCopied] = useState(false);

  const profile = data?.data?.data;
  console.log(profile);

  const { mutate: updateProfilePic, isPending: updatingPic } = useUpdateUserProfilePic();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    updateProfilePic(formData);
  };

  const handleCopyOrgId = (orgId: string) => {
    if (!orgId) return;
    navigator.clipboard.writeText(orgId);
    setCopied(true);
    toast.success("Organization ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        {/* Header card skeleton */}
        <div className="h-44 w-full bg-muted/40 rounded-2xl border border-border/40" />

        {/* Grid layout skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted/40 rounded-2xl border border-border/40" />
          <div className="h-64 bg-muted/40 rounded-2xl border border-border/40" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    const errorMsg = (error as any)?.response?.data?.message || "Failed to load profile details";
    return (
      <div className="p-6 max-w-xl mx-auto text-center mt-12 space-y-4">
        <div className="inline-flex p-4 bg-destructive/10 text-destructive rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Error Loading Profile</h2>
        <p className="text-muted-foreground text-sm">{errorMsg}</p>
        <Button
          onClick={() => refetch()}
          size="sm"
          className="rounded-lg"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Generate initials for avatar
  const initials = profile.name
    ? profile.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "U";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Profile Header card with ambient glow and premium aesthetic */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12" />

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group flex-shrink-0">
            {profile.profilePic ? (
              <img
                src={profile.profilePic}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-primary/20 shadow-md transition-all duration-200"
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 via-primary/10 to-indigo-500/20 text-primary border-2 border-primary/20 shadow-md">
                <span className="text-3xl font-extrabold tracking-wider">{initials}</span>
              </div>
            )}

            {/* Spinner Overlay when uploading or updating */}
            {updatingPic && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}

            {/* Edit Label/Pencil Icon */}
            {!updatingPic && (
              <label
                htmlFor="profile-pic-upload"
                className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all rounded-full cursor-pointer shadow-md border border-background"
                title="Change Profile Picture"
              >
                <Pencil className="w-3.5 h-3.5" />
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
                {profile.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 justify-center">
                <Badge
                  variant="outline"
                  className={
                    profile.type === "admin"
                      ? "capitalize text-sky-500 bg-sky-500/10 border-sky-500/20"
                      : "capitalize text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
                  }
                >
                  {profile.type}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    profile.isVerified
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }
                >
                  {profile.isVerified ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Unverified
                    </span>
                  )}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground flex items-center gap-1.5 justify-center md:justify-start">
              <Mail className="w-4 h-4 text-muted-foreground/60" /> {profile.email}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info Card */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground font-heading">
              <Mail className="w-4 h-4 text-primary" /> Personal & Contact Info
            </CardTitle>
            <CardDescription>
              Your contact details and secondary communications.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Primary Email */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Email Address
              </span>
              <span className="text-sm font-semibold text-foreground break-all">
                {profile.email}
              </span>
            </div>

            {/* Mobile number */}
            <div className="flex flex-col gap-1 border-t border-border/40 pt-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Mobile Number
              </span>
              <span className="text-sm font-semibold text-foreground">
                {profile.mobile || "—"}
              </span>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1 border-t border-border/40 pt-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Address
              </span>
              <span className="text-sm font-semibold text-foreground capitalize">
                {profile.address || "—"}
              </span>
            </div>

            {/* Secondary Emails */}
            <div className="flex flex-col gap-2 border-t border-border/40 pt-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Secondary Emails
              </span>
              {profile.secondaryEmails && profile.secondaryEmails.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.secondaryEmails.map((email: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs font-mono font-normal">
                      {email}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No secondary emails registered
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System & Org Metadata Card */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground font-heading">
              <Shield className="w-4 h-4 text-primary" /> System Metadata
            </CardTitle>
            <CardDescription>
              Organization bindings and account audit timestamps.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Organization ID */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Org ID
              </span>
              <div className="flex items-center gap-2 bg-muted/40 p-2.5 rounded-lg border border-border/40 group relative">
                <span className="font-mono text-xs text-foreground select-all break-all pr-8">
                  {profile.orgId || "—"}
                </span>
                {profile.orgId && (
                  <button
                    onClick={() => handleCopyOrgId(profile.orgId)}
                    className="absolute right-2 p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-all duration-150"
                    title="Copy Org ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Verification Status */}
            <div className="flex justify-between items-center text-sm border-t border-border/40 pt-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Verification Status
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                {profile.isVerified ? (
                  <span className="flex items-center gap-1 text-emerald-500 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Account
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> Unverified Account
                  </span>
                )}
              </span>
            </div>

            {/* Created At */}
            <div className="flex justify-between items-center text-sm border-t border-border/40 pt-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Created At
              </span>
              <span className="font-semibold text-foreground text-xs font-mono">
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "—"}
              </span>
            </div>

            {/* Updated At */}
            <div className="flex justify-between items-center text-sm border-t border-border/40 pt-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Updated At
              </span>
              <span className="font-semibold text-foreground text-xs font-mono">
                {profile.updatedAt
                  ? new Date(profile.updatedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;

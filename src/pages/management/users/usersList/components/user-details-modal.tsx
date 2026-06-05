import React from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { User } from "../../types";

interface UserDetailsModalProps {
  user: User | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose,
}) => {
  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-6 rounded-2xl">
        {user && (
          <div className="space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-3">
                <DialogTitle className="text-xl font-bold font-heading flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-primary" /> {user.name}
                </DialogTitle>
                <Badge
                  variant="outline"
                  className={
                    user.type === "admin"
                      ? "capitalize text-sky-500 bg-sky-500/10 border-sky-500/20"
                      : "capitalize text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
                  }
                >
                  {user.type}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    user.status === "active" || (user as any).isVerified
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }
                >
                  {user.status || "Active"}
                </Badge>
              </div>
              <DialogDescription>
                Detailed profile settings, contact details, and organization metadata.
              </DialogDescription>
            </DialogHeader>

            {/* Profile & Organization Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-primary" /> Contact Details
                </h4>
                <div className="bg-muted/10 border border-border/40 p-4 rounded-xl space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Email Address</span>
                    <span className="text-sm font-semibold text-foreground break-all">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-border/40 pt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Mobile Number
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {user.mobile || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-border/40 pt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Address
                    </span>
                    <span className="text-sm font-semibold text-foreground capitalize">
                      {user.address || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Access & System Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" /> System Metadata
                </h4>
                <div className="bg-muted/10 border border-border/40 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Org ID
                    </span>
                    <span className="font-semibold text-foreground font-mono text-xs">
                      {(user as any).orgId || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Verification Status
                    </span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      {(user as any).isVerified ? (
                        <span className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Unverified
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-border/40 pt-2">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Created At
                    </span>
                    <span className="font-semibold text-foreground text-xs">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Updated At
                    </span>
                    <span className="font-semibold text-foreground text-xs">
                      {user.updatedAt
                        ? new Date(user.updatedAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;

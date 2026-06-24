import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store";
import LoadingFallback from "@/components/ui/loading-fallback";
import { apiClient } from "@/api/apiClient";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const selectedOrg = useAppStore((state) => state.selectedOrg);
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  const isSuperAdmin = user?.type === "super_admin";
  // A super admin only has org context once they've "entered" an org.
  const superAdminWithoutSelectedOrg = isSuperAdmin && !selectedOrg;

  useEffect(() => {
    // No token, or a super admin who hasn't entered an org yet → nothing to fetch.
    if (!hasHydrated) {
      return;
    }

    const fetchConfig = async () => {
      try {
        const orgConfigStr = sessionStorage.getItem("orgConfig");
        if (!orgConfigStr) {
          const configResponse = await apiClient().get("getOrgConfig");
          sessionStorage.setItem(
            "orgConfig",
            JSON.stringify(configResponse.data),
          );
        }
      } catch (error) {
        console.error("Failed to fetch organization config:", error);
      }
    };

    fetchConfig();
  }, [hasHydrated, token]);

  // Prevent redirect flicker during hydration / config fetch.
  if (!hasHydrated) {
    return <LoadingFallback />;
  }

  // Hydrated and no token → login.
  if (!token) {
    console.warn("User not authenticated, navigating to login");
    return <Navigate to="/login" replace />;
  }

  // A super admin in the org app without an entered org belongs in the
  // all-orgs super-admin area.
  if (superAdminWithoutSelectedOrg) {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  return <>{children}</>;
};

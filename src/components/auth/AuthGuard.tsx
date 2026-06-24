import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store";
import LoadingFallback from "@/components/ui/loading-fallback";
import { useGetOrgConfig } from "@/query/useOrgConfig";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const selectedOrg = useAppStore((state) => state.selectedOrg);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const orgConfig = useAppStore((state) => state.orgConfig);
  const setOrgConfig = useAppStore((state) => state.setOrgConfig);

  const isSuperAdmin = user?.type === "super_admin";
  // A super admin only has org context once they've "entered" an org.
  const superAdminWithoutSelectedOrg = isSuperAdmin && !selectedOrg;

  const { data: fetchedConfig, isLoading: configLoading } = useGetOrgConfig(
    hasHydrated && !!token && !superAdminWithoutSelectedOrg,
  );

  useEffect(() => {
    if (fetchedConfig) {
      setOrgConfig(fetchedConfig?.data?.orgData);
    }
  }, [fetchedConfig, setOrgConfig]);

  // Prevent redirect flicker during hydration / config fetch.
  if (!hasHydrated || (!orgConfig && configLoading)) {
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

import React from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store";
import LoadingFallback from "@/components/ui/loading-fallback";

interface SuperAdminGuardProps {
  children: React.ReactNode;
}

// Guards the super-admin area: requires a hydrated store, a token, and a
// super_admin user. Non-super-admins are sent to the normal app.
export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ children }) => {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  if (!hasHydrated) return <LoadingFallback />;
  if (!token) return <Navigate to="/super-admin/login" replace />;
  if (user?.type !== "super_admin") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

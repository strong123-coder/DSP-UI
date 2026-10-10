import React from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store";
import LoadingFallback from "@/components/ui/loading-fallback";

interface SupplyGuardProps {
  children: React.ReactNode;
}

// Guards the MCP publisher (supply) area. Other user types go to their own app.
export const SupplyGuard: React.FC<SupplyGuardProps> = ({ children }) => {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  if (!hasHydrated) return <LoadingFallback />;
  if (!token) return <Navigate to="/supply/login" replace />;
  if (user?.type === "super_admin") return <Navigate to="/super-admin/dashboard" replace />;
  if (user?.type !== "supply") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
